import fs from 'node:fs';
import { execSync } from 'node:child_process';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

console.log('\n🔒 Cloud DevSecOps Pipeline — Verification Suite\n');

// 1. Upstream cleanliness
console.log('📝 Upstream cleanliness');
const filesToCheck = [
  'LICENSE',
  'README.md',
  'package.json',
  'CITATION.cff',
  'MAINTAINERS.md',
  '.github/workflows/devsecops-pipeline.yml',
  '.gitleaks.toml',
  'app/app.py',
  'Dockerfile'
];

const bannedStrings = ['calvareh', 'cristian.alvarezhd@gmail.com'];

for (const file of filesToCheck) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    for (const banned of bannedStrings) {
      assert(!content.toLowerCase().includes(banned.toLowerCase()), `${file} has no "${banned}"`);
    }
  }
}

// 2. Required files
console.log('\n📦 Required files');
const requiredFiles = [
  'LICENSE',
  'README.md',
  'CITATION.cff',
  'MAINTAINERS.md',
  'package.json',
  '.gitignore',
  '.gitleaks.toml',
  'Dockerfile',
  '.github/workflows/devsecops-pipeline.yml',
  'app/app.py',
  'app/requirements.txt',
  'config/test-secrets.env',
  'terraform-insecure-demo/main.tf',
  'terraform-secure/main.tf',
  'docs/screenshots/devsecops-pipeline-architecture.png'
];

for (const req of requiredFiles) {
  assert(fs.existsSync(req), `${req} exists`);
}

// 3. License check
console.log('\n🔐 License check');
const license = fs.readFileSync('LICENSE', 'utf8');
assert(license.includes('Abdullah Formuli'), 'LICENSE mentions Abdullah Formuli');

// 4. Citation check
console.log('\n📜 Citation check');
const citation = fs.readFileSync('CITATION.cff', 'utf8');
assert(citation.includes('Abdullah') && citation.includes('Formuli'), 'CITATION.cff author is Abdullah Formuli');
assert(citation.includes('authrain-cloud-abdullahformuli/cloud-devsecops-pipeline'), 'CITATION.cff points to authrain-cloud-abdullahformuli/cloud-devsecops-pipeline');

// 5. Maintainers check
console.log('\n👥 Maintainers check');
const maintainers = fs.readFileSync('MAINTAINERS.md', 'utf8');
assert(maintainers.includes('Abdullah Formuli') || maintainers.includes('abdullahformuli'), 'MAINTAINERS.md author is Abdullah Formuli');

// 6. README check
console.log('\n📖 README check');
const readme = fs.readFileSync('README.md', 'utf8');
assert(readme.includes('authrain-cloud-abdullahformuli/cloud-devsecops-pipeline'), 'README.md points to authrain-cloud-abdullahformuli/cloud-devsecops-pipeline');

// 7. Package.json check
console.log('\n📦 package.json check');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert(pkg.author.includes('Abdullah Formuli'), 'package.json author is Abdullah Formuli');
assert(pkg.repository.url.includes('authrain-cloud-abdullahformuli/cloud-devsecops-pipeline'), 'package.json points to correct repo');

// 8. Python application syntax check
console.log('\n🐍 Python syntax check');
try {
  execSync('python3 -m py_compile app/app.py');
  assert(true, 'app/app.py syntax is valid');
} catch (err) {
  assert(false, `Python syntax error: ${err.message}`);
}

// 9. Pipeline workflow structure check
console.log('\n⚙️ Pipeline workflow check');
const workflow = fs.readFileSync('.github/workflows/devsecops-pipeline.yml', 'utf8');
assert(workflow.includes('secret-scan'), 'Workflow defines secret-scan job');
assert(workflow.includes('dependency-scan'), 'Workflow defines dependency-scan job');
assert(workflow.includes('sast-scan'), 'Workflow defines sast-scan job');
assert(workflow.includes('container-scan'), 'Workflow defines container-scan job');
assert(workflow.includes('iac-scan'), 'Workflow defines iac-scan job');

console.log('\n' + '═'.repeat(50));
console.log(`  ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50) + '\n');

if (failed > 0) {
  process.exit(1);
}
