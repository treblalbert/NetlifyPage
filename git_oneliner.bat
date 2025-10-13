@echo off
echo =============================================
echo     Auto Commit & Push with Git LFS Support
echo =============================================
echo.

:: Initialize Git LFS (safe to run every time)
git lfs install >nul 2>&1

:: Track common large file types (add more if needed)
git lfs track "*.exe"
git lfs track "*.zip"
git lfs track "*.mp4"
git lfs track "*.wav"
git lfs track "*.fbx"
git lfs track "*.psd"
git lfs track "*.png"

:: Ensure .gitattributes is included in commits
git add .gitattributes >nul 2>&1

:: Add all changes
echo Adding all changes...
git add -A

:: Commit (only if there are changes)
git diff --cached --quiet
if %errorlevel% equ 1 (
    echo Committing changes...
    git commit -m "Auto commit with LFS support"
) else (
    echo No changes to commit.
)

:: Push to main branch
echo Pushing to origin/main...
git push origin main

echo.
echo =============================================
echo         ✅ Done! Large files handled by LFS
echo =============================================
pause
