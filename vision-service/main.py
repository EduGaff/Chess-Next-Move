import cv2
import numpy as np
import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],\
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load templates
TEMPLATES_DIR = "templates"
templates = {}

def load_templates():
    if not os.path.exists(TEMPLATES_DIR):
        print(f"Warning: {TEMPLATES_DIR} not found.")
        return
        
    for filename in os.listdir(TEMPLATES_DIR):
        if filename.endswith(".png"):
            piece_name = filename.replace(".png", "")
            path = os.path.join(TEMPLATES_DIR, filename)
            # Load as grayscale
            tpl = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
            if tpl is not None:
                templates[piece_name] = tpl
                
load_templates()

def get_best_match(square_gray):
    """
    Given a grayscale 80x80 (approx) square, find the highest confidence match
    from the templates.
    """
    best_piece = None
    best_val = -1
    
    # We resize the square to match the template size in case the board upload 
    # is a different resolution than our original extraction
    
    # Use empty as fallback
    best_piece = "empty"
    
    for piece_name, tpl in templates.items():
        # Resize square to template size if needed
        h, w = tpl.shape
        square_resized = cv2.resize(square_gray, (w, h))
        
        # Template matching
        res = cv2.matchTemplate(square_resized, tpl, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, _ = cv2.minMaxLoc(res)
        
        if max_val > best_val:
            best_val = max_val
            best_piece = piece_name
            
    # For FEN, we don't care about light/dark distinction of the empty squares
    if "empty" in best_piece:
        return "1", best_val
        
    # piece_name is like 'wp', 'bn'
    color = best_piece[0]
    ptype = best_piece[1]
    
    # FEN format: white is uppercase, black is lowercase
    fen_char = ptype.upper() if color == 'w' else ptype.lower()
    return fen_char, best_val

@app.post("/process")
async def process_image(image: UploadFile = File(...), sideToMove: str = Form("w")):
    """
    Receives an image, normalizes it, slices it, matches templates, 
    and returns a FEN string.
    """
    if len(templates) == 0:
        raise HTTPException(status_code=500, detail="Templates not loaded. Run extraction script first.")
        
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Basic assume image is exactly the board (cropped square)
        # If the user uploads full screen, a contour detection + warping step 
        # is needed here. For this MVP, we assume a square board crop.
        
        height, width = img.shape[:2]
        
        # Convert to grayscale for matching
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Ensure perfect square math
        square_h = height // 8
        square_w = width // 8
        
        fen_rows = []
        debug_grid = []
        
        for rank in range(8):
            empty_count = 0
            row_fen = ""
            debug_row = []
            
            for file in range(8):
                y1 = rank * square_h
                y2 = (rank + 1) * square_h
                x1 = file * square_w
                x2 = (file + 1) * square_w
                
                square_gray = gray[y1:y2, x1:x2]
                
                char, conf = get_best_match(square_gray)
                debug_row.append({"square": f"{chr(97+file)}{8-rank}", "detected": char, "confidence": float(conf)})
                
                if char == "1":
                    empty_count += 1
                else:
                    if empty_count > 0:
                        row_fen += str(empty_count)
                        empty_count = 0
                    row_fen += char
                    
            if empty_count > 0:
                row_fen += str(empty_count)
                
            fen_rows.append(row_fen)
            debug_grid.append(debug_row)
            
        piece_placement = "/".join(fen_rows)
        
        # Complete the FEN string
        final_fen = f"{piece_placement} {sideToMove} KQkq - 0 1"
        
        return {
            "fen": final_fen,
            "metadata": {
                "resolution": f"{width}x{height}",
                "grid": debug_grid
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting Vision Pipeline Microservice...")
    uvicorn.run(app, host="127.0.0.1", port=5000)
