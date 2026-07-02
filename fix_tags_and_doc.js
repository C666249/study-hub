const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============ 行政法知识点分类 ============
function classifyAdminTag(q) {
  const text = (q.question + ' ' + (q.options ? Object.values(q.options).join(' ') : '')).toLowerCase();
  
  // 8. 行政诉讼与国家赔偿
  if (/行政诉讼|受案范围|管辖|证据|起诉|立案|判决|裁定|被告|原告|举证责任|国家赔偿|行政赔偿|赔偿义务机关|赔偿请求|赔偿方式|赔偿时效|消除影响|恢复名誉|赔礼道歉/.test(text)) {
    return '行政诉讼与国家赔偿';
  }
  // 7. 行政复议
  if (/行政复议|复议机关|复议决定|复议申请|复议程序|复议维持|复议改变|复议前置/.test(text)) {
    return '行政复议';
  }
  // 6. 行政强制
  if (/行政强制|强制执行|强制措施|查封|扣押|冻结|加处罚款|滞纳金|代履行|执行罚/.test(text)) {
    return '行政强制';
  }
  // 5. 行政处罚
  if (/行政处罚|处罚|罚款|警告|通报批评|没收|责令停产|吊销|拘留|一事不再罚|当场处罚|听证|罚过相当|裁量基准|追责/.test(text)) {
    return '行政处罚';
  }
  // 4. 行政行为（其他类型）
  if (/行政确认|行政调解|行政仲裁|行政征收|行政征用|行政指导|行政合同|行政应急|行政检查|行政调查|行政奖励|行政给付|行政规划|行政决策/.test(text)) {
    return '其他行政行为';
  }
  // 3. 公务员法
  if (/公务员|职位分类|综合管理类|专业技术类|行政执法类|领导职务|处分|追偿|权利义务|奖惩|编制/.test(text)) {
    return '公务员法';
  }
  // 2. 行政主体
  if (/行政主体|行政机关|派出机关|派出机构|被授权|受委托|委托组织|行政相对人|行政第三人|行政组织|职权|职责/.test(text)) {
    return '行政主体';
  }
  // 1. 行政法基本理论
  if (/行政法|基本原则|合法性|合理性|比例原则|信赖保护|高效便民|行政法律关系|渊源|立法法|地方性法规|规章|规范性文件|行政程序|正当程序|行政公开/.test(text)) {
    return '行政法基本理论';
  }
  
  return '行政法基本理论';
}

// ============ 处理行政法 tags ============
const adminPath = 'D:/Claude/projects/study-hub/data/行政法.json';
const admin = JSON.parse(fs.readFileSync(adminPath, 'utf8'));

admin.forEach(q => {
  q.tags = [classifyAdminTag(q)];
});

const tagStats = {};
admin.forEach(q => { tagStats[q.tags[0]] = (tagStats[q.tags[0]] || 0) + 1; });
console.log('=== 行政法知识点分布 ===');
Object.entries(tagStats).sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {
  console.log(`  ${tag}: ${count}题`);
});

fs.writeFileSync(adminPath, JSON.stringify(admin, null, 2), 'utf8');
console.log('行政法.json 已更新 tags');

// ============ 转换 .doc 文件 ============
console.log('\n=== 处理马原 .doc 文件 ===');
const docPath = 'D:/图片/下的/2022.4.29马克思主义基本原理概论配套复习题(1).doc';

if (!fs.existsSync(docPath)) {
  console.log('文件不存在:', docPath);
  process.exit(0);
}

// 用 Word COM 转换为 docx
const tempDir = 'D:/Claude/projects/study-hub/temp_doc';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const docxOutput = path.join(tempDir, 'converted.docx');

try {
  const psScript = `
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open('${docPath.replace(/'/g, "''")}')
    $doc.SaveAs2('${docxOutput.replace(/'/g, "''")}', 16)
    $doc.Close($false)
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    Write-Output 'CONVERTED'
  `;
  const result = execSync(`powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8', timeout: 60000, stdio: 'pipe'
  });
  console.log('Word COM 转换结果:', result.trim());
} catch (e) {
  console.log('Word COM 转换失败:', e.message.substring(0, 200));
  
  // 备选方案：用 LibreOffice
  try {
    execSync(`soffice --headless --convert-to docx --outdir "${tempDir}" "${docPath}"`, {
      encoding: 'utf8', timeout: 60000, stdio: 'pipe'
    });
    console.log('LibreOffice 转换成功');
  } catch (e2) {
    console.log('LibreOffice 也不可用:', e2.message.substring(0, 100));
    console.log('请手动用 Word 打开该 .doc 文件并另存为 .docx 格式');
    process.exit(0);
  }
}

if (!fs.existsSync(docxOutput)) {
  console.log('转换后的 docx 文件不存在');
  process.exit(0);
}

// 解析转换后的 docx
const zipPath = path.join(tempDir, 'converted.zip');
fs.copyFileSync(docxOutput, zipPath);
const extractPath = path.join(tempDir, 'extracted');
try {
  execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractPath}' -Force"`, { stdio: 'pipe' });
} catch (e) {
  console.log('解压失败:', e.message.substring(0, 100));
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

console.log('提取到', lines.length, '行');
console.log('前20行预览:');
lines.slice(0, 20).forEach((l, i) => console.log(`  [${i}] ${l.substring(0, 80)}`));

// 写入临时文件供下一步解析
fs.writeFileSync(path.join(tempDir, 'extracted_text.txt'), lines.join('\n'), 'utf8');
console.log('\n文本已保存到 temp_doc/extracted_text.txt');
console.log('请检查上面的预览，确认格式后我再解析入题库');
