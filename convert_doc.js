const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tempDir = 'D:/Claude/projects/study-hub/temp_doc';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// 把 .doc 复制到纯 ASCII 路径
const srcDoc = 'D:/图片/下的/2022.4.29马克思主义基本原理概论配套复习题(1).doc';
const asciiDoc = path.join(tempDir, 'source.doc');
fs.copyFileSync(srcDoc, asciiDoc);
console.log('已复制到:', asciiDoc);

const docxOutput = path.join(tempDir, 'converted.docx');

// 用 PowerShell 脚本文件（避免转义问题）
const psScriptPath = path.join(tempDir, 'convert.ps1');
const psScript = `
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('${asciiDoc.replace(/\\/g, '\\\\')}')
    $doc.SaveAs2('${docxOutput.replace(/\\/g, '\\\\')}', 16)
    $doc.Close($false)
    Write-Output 'SUCCESS'
} catch {
    Write-Output 'ERROR: ' + $_.Exception.Message
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
`;
fs.writeFileSync(psScriptPath, psScript, 'utf8');

try {
  const result = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psScriptPath}"`, {
    encoding: 'utf8', timeout: 90000, stdio: 'pipe'
  });
  console.log('转换结果:', result.trim());
} catch (e) {
  console.log('转换失败:', e.message.substring(0, 300));
  if (e.stderr) console.log('STDERR:', e.stderr.substring(0, 300));
}

if (fs.existsSync(docxOutput)) {
  console.log('docx 文件已生成, 大小:', fs.statSync(docxOutput).size, 'bytes');
  
  // 解析 docx
  const zipPath = path.join(tempDir, 'converted.zip');
  fs.copyFileSync(docxOutput, zipPath);
  const extractPath = path.join(tempDir, 'extracted');
  
  try {
    execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractPath}' -Force"`, { stdio: 'pipe' });
  } catch (e) {
    console.log('解压失败');
    process.exit(0);
  }
  
  const xmlPath = path.join(extractPath, 'word', 'document.xml');
  if (!fs.existsSync(xmlPath)) {
    console.log('未找到 document.xml');
    process.exit(0);
  }
  
  const xmlContent = fs.readFileSync(xmlPath, 'utf8');
  const text = xmlContent.replace(/<[^>]+>/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  console.log('\n提取到', lines.length, '行');
  console.log('前30行预览:');
  lines.slice(0, 30).forEach((l, i) => console.log(`  [${i}] ${l.substring(0, 100)}`));
  
  fs.writeFileSync(path.join(tempDir, 'extracted_text.txt'), lines.join('\n'), 'utf8');
} else {
  console.log('docx 文件未生成');
  
  // 检查 Word 是否安装
  try {
    const check = execSync('powershell -NoProfile -Command "Get-ItemProperty HKLM:\\SOFTWARE\\Classes\\Word.Application -ErrorAction SilentlyContinue | Select-Object -ExpandProperty \'(default)\'"', { encoding: 'utf8', stdio: 'pipe' });
    console.log('Word 注册信息:', check.trim());
  } catch (e) {
    console.log('Word 似乎未安装');
  }
}
