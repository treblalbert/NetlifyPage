@echo off
echo === Auto Git Commit & Push with Git LFS ===

:: Initialize Git LFS if not already set up
git lfs install

:: Track common large file types (add more if needed)
git lfs track "*.psd"
git lfs track "*.fbx"
git lfs track "*.png"
git lfs track "*.mp4"
git lfs track "*.zip"
git lfs track "*.wav"

:: Make sure .gitattributes (created by LFS) is added
git add .gitattributes

:: Add and commit all changes
git add .
git commit -m "Auto commit"

:: Push to GitHub (LFS will handle large files)
git push origin main

echo === Done! Large files handled by Git LFS ===
pause
