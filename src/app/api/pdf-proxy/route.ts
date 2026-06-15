import { NextResponse } from 'next/server';
import https from 'https';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Allowed domains – keep the list short to avoid abuse
const ALLOWED_HOSTS = [
  'ncert.nic.in',
  'cbseacademic.nic.in',
  'cdn.jsdelivr.net',
  'raw.githubusercontent.com',
];

const CACHE_DIR = path.join(process.cwd(), '.pdf_cache');
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (err) {
    console.error('[PDF Proxy] Failed to create cache directory:', err);
  }
}

function isAllowed(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

function fetchPdf(url: string, retries = 3): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*',
      },
      minVersion: 'TLSv1.2' as const,
      rejectUnauthorized: false,
      timeout: 15000, // 15 seconds timeout
    };

    const req = https.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        fetchPdf(redirectUrl, retries).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        if (retries > 0) {
          console.log(`[PDF Proxy] HTTP ${res.statusCode} for ${url}. Retrying... (${retries} left)`);
          fetchPdf(url, retries - 1).then(resolve).catch(reject);
        } else {
          reject(new Error(`HTTP status ${res.statusCode}`));
        }
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('timeout', () => {
      req.destroy();
      if (retries > 0) {
        console.log(`[PDF Proxy] Timeout for ${url}. Retrying... (${retries} left)`);
        fetchPdf(url, retries - 1).then(resolve).catch(reject);
      } else {
        reject(new Error('Request timed out'));
      }
    });

    req.on('error', (err) => {
      if (retries > 0) {
        console.log(`[PDF Proxy] Error ${err.message} for ${url}. Retrying... (${retries} left)`);
        fetchPdf(url, retries - 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });

    req.end();
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get('url');
  let filename = searchParams.get('filename') || 'document.pdf';
  filename = filename
    .replace(/["\n\r]/g, '')
    .replace(/[\u2013\u2014]/g, '-') // Replace en-dash and em-dash with standard hyphen
    .replace(/[^\x00-\x7F]/g, '');   // Strip any remaining non-ASCII characters to prevent HTTP header serialization errors

  if (!pdfUrl || !isAllowed(pdfUrl)) {
    return new NextResponse('Invalid or disallowed URL', { status: 400 });
  }

  // Generate cache path
  const hash = crypto.createHash('md5').update(pdfUrl).digest('hex');
  const cachePath = path.join(CACHE_DIR, `${hash}.pdf`);

  // Check disk cache first
  if (fs.existsSync(cachePath)) {
    try {
      console.log(`[PDF Proxy] Cache hit for ${pdfUrl}`);
      const pdfBuffer = fs.readFileSync(cachePath);
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename}"`,
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (cacheReadErr) {
      console.error('[PDF Proxy] Failed to read from cache, refetching:', cacheReadErr);
    }
  }

  try {
    let pdfBuffer = await fetchPdf(pdfUrl);

    // Override the internal PDF metadata title so Chrome's viewer shows the correct name
    // instead of the original author's filename (e.g. "CHAP 2.pmd")
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      pdfDoc.setTitle(filename.replace(/\.pdf$/i, ''));
      const modifiedBytes = await pdfDoc.save();
      pdfBuffer = Buffer.from(modifiedBytes);
    } catch (metaErr) {
      console.warn('[PDF Proxy] Failed to modify PDF metadata:', metaErr);
      // Proceed with the original buffer if parsing fails
    }

    // Write to disk cache for future requests
    try {
      fs.writeFileSync(cachePath, pdfBuffer);
      console.log(`[PDF Proxy] Cached successfully: ${pdfUrl} -> ${cachePath}`);
    } catch (cacheWriteErr) {
      console.error('[PDF Proxy] Failed to write to disk cache:', cacheWriteErr);
    }

    // Return with ONLY our own headers — strip all upstream headers
    // that could block iframe rendering (X-Frame-Options, CSP, etc.)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('PDF proxy error:', err);
    return new NextResponse(`Error fetching PDF: ${err.message || err}`, { status: 500 });
  }
}

