
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('D:\\Claude\\projects\\study-hub\\temp_doc\\source.doc')
    $doc.SaveAs2('D:\\Claude\\projects\\study-hub\\temp_doc\\converted.docx', 16)
    $doc.Close($false)
    Write-Output 'SUCCESS'
} catch {
    Write-Output 'ERROR: ' + $_.Exception.Message
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
