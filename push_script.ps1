$ErrorActionPreference = "Continue"

git remote add origin https://github.com/Prem-333/P.A.C.T---Hacksprint.git
git branch -M main

# Function to commit if there are staged changes
function Commit-Changes {
    param([string]$message)
    $status = git status --porcelain
    if ($status) {
        git commit -m $message
    }
}

git add .gitignore README.md contracts/package.json contracts/tsconfig.json contracts/hardhat.config.ts frontend/package.json frontend/tsconfig.json frontend/eslint.config.mjs frontend/next.config.ts frontend/postcss.config.mjs frontend/README.md frontend/.gitignore frontend/next-env.d.ts
Commit-Changes "chore: Initialize project setup and configurations"

git add contracts/contracts/
Commit-Changes "feat(contracts): Implement core smart contracts"

git add contracts/scripts/ contracts/test/
Commit-Changes "test(contracts): Add deployment scripts and test cases"

git add frontend/public/ frontend/AGENTS.md frontend/CLAUDE.md
Commit-Changes "chore(frontend): Add public assets and documentation"

git add frontend/src/
Commit-Changes "feat(frontend): Implement frontend UI and application logic"

git add .
Commit-Changes "chore: Lock dependencies and finalize structure"

git push -u origin main
