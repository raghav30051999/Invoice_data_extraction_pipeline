from fastapi import FastAPI
from pydantic import BaseModel
import ocr_engine

app = FastAPI()

class RunRequest(BaseModel):
    file_path: str

@app.post("/run-script")
def run_script(req: RunRequest):
    full_path = f"/files/{req.file_path}"
    text = ocr_engine.extract_with_ocr(full_path, dpi=450)
    return {"text": text}