import cv2
import numpy as np
import os

def extract_templates_from_starting_board(image_path, output_dir):
    """
    Given a perfectly aligned starting board image from chess.com,
    extracts the 8x8 squares and saves the pieces as templates.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not read {image_path}")
        return

    height, width = img.shape[:2]
    
    # We assume the image is ONLY the board (a square).
    # If not perfectly square, we'll force it to be for the math.
    square_h = height // 8
    square_w = width // 8

    # The starting position piece mapping (standard chess)
    # Ranks 0-1 are Black pieces (a8-h8, a7-h7)
    # Ranks 6-7 are White pieces (a2-h2, a1-h1)
    
    # Let's map coordinates (rank, file) to piece names
    # rank 0 is top (8th rank in chess)
    piece_map = {
        (0, 0): 'br', (0, 1): 'bn', (0, 2): 'bb', (0, 3): 'bq', (0, 4): 'bk', (0, 5): 'bb', (0, 6): 'bn', (0, 7): 'br',
        (1, 0): 'bp', (1, 1): 'bp', (1, 2): 'bp', (1, 3): 'bp', (1, 4): 'bp', (1, 5): 'bp', (1, 6): 'bp', (1, 7): 'bp',
        # Empty squares sample (rank 3 is 5th rank in chess)
        (3, 0): 'empty_light', (3, 1): 'empty_dark',
        (6, 0): 'wp', (6, 1): 'wp', (6, 2): 'wp', (6, 3): 'wp', (6, 4): 'wp', (6, 5): 'wp', (6, 6): 'wp', (6, 7): 'wp',
        (7, 0): 'wr', (7, 1): 'wn', (7, 2): 'wb', (7, 3): 'wq', (7, 4): 'wk', (7, 5): 'wb', (7, 6): 'wn', (7, 7): 'wr',
    }

    saved_pieces = set()

    for rank in range(8):
        for file in range(8):
            coord = (rank, file)
            if coord in piece_map:
                piece_name = piece_map[coord]
                
                # Only save one template of each type
                if piece_name not in saved_pieces:
                    # Calculate bounding box for this square
                    y1 = rank * square_h
                    y2 = (rank + 1) * square_h
                    x1 = file * square_w
                    x2 = (file + 1) * square_w
                    
                    square_img = img[y1:y2, x1:x2]
                    
                    # Convert to grayscale for template matching later
                    square_gray = cv2.cvtColor(square_img, cv2.COLOR_BGR2GRAY)
                    
                    out_path = os.path.join(output_dir, f"{piece_name}.png")
                    cv2.imwrite(out_path, square_gray)
                    print(f"Saved template: {out_path}")
                    
                    saved_pieces.add(piece_name)

    print("Template extraction complete.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python extract_templates.py <path_to_board_image> <output_directory>")
    else:
        extract_templates_from_starting_board(sys.argv[1], sys.argv[2])
