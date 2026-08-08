"""
EduTrack AI - Self-Hosted Local AI Server (Python + PyTorch)
Runs your locally trained PyTorch model as an HTTP server on http://localhost:5000
No third-party APIs needed! 100% Offline & Private.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from pathlib import Path

# Load Local Model using PyTorch / Transformers
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "edutrack-local-ai"
DEFAULT_MODEL = "Qwen/Qwen1.5-0.5B-Chat"

model = None
tokenizer = None

def load_model():
    global model, tokenizer
    if not HAS_TORCH:
        print("⚠️ PyTorch/Transformers not installed yet. Running mock server mode.")
        return

    path_to_load = str(MODEL_PATH) if MODEL_PATH.exists() else DEFAULT_MODEL
    print(f"🤖 Loading PyTorch model from: {path_to_load}...")
    
    tokenizer = AutoTokenizer.from_pretrained(path_to_load, trust_remote_code=True)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = AutoModelForCausalLM.from_pretrained(
        path_to_load,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else None,
        trust_remote_code=True
    )
    print(f"✅ Model loaded successfully on {device.upper()}!")

class LocalAIServer(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        data = json.loads(body.decode("utf-8"))

        user_prompt = data.get("prompt", "")
        system_prompt = "You are EduTrack AI tutor for CBSE Class 6-10 students."

        reply = ""
        if model and tokenizer:
            full_input = f"<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\n{user_prompt}<|im_end|>\n<|im_start|>assistant\n"
            inputs = tokenizer(full_input, return_tensors="pt").to(model.device)
            outputs = model.generate(**inputs, max_new_tokens=256, temperature=0.7)
            reply = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        else:
            reply = f"[EduTrack Local PyTorch Model]: Received prompt: '{user_prompt}'. (Model weights loading/mock active)."

        response = json.dumps({"reply": reply})
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(response.encode("utf-8"))

def run_server(port=5000):
    load_model()
    server_address = ("", port)
    httpd = HTTPServer(server_address, LocalAIServer)
    print(f"🚀 EduTrack Local AI Server running at http://localhost:{port}")
    print("Your Next.js app can now connect to this local server with 0 third-party API dependencies!")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
