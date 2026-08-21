const fs = require('fs');
fs.mkdirSync('src/app/errors', { recursive: true });

const code = `"use client";

import { writeFileSync, mkdirSync } from "fs";
`;

// Write page file
