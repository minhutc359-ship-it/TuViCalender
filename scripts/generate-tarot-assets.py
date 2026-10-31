"""Compatibility entry point: regenerate the original narrative SVG deck."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name("generate-tarot-scenes.py")), run_name="__main__")
