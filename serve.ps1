param([int]$Port = 8080)

# TcpListener (в отличие от HttpListener) не требует прав администратора
# для привязки к 0.0.0.0 — поэтому сайт становится доступен и по localhost,
# и по локальной сети (с телефона) одним и тем же процессом.

$root = $PSScriptRoot
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
$listener.Start()
Write-Output "Serving $root on port $Port (all local network interfaces)"

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".mp3"  = "audio/mpeg"
    ".ico"  = "image/x-icon"
}

function Read-HttpRequestLine([System.IO.Stream]$stream) {
    $bytes = New-Object System.Collections.Generic.List[byte]
    $prev4 = New-Object byte[] 4
    while ($true) {
        $b = $stream.ReadByte()
        if ($b -eq -1) { break }
        $bytes.Add([byte]$b)
        $n = $bytes.Count
        if ($n -ge 4 -and $bytes[$n-4] -eq 13 -and $bytes[$n-3] -eq 10 -and $bytes[$n-2] -eq 13 -and $bytes[$n-1] -eq 10) {
            break
        }
        if ($n -gt 16384) { break } # защита от бесконечных заголовков
    }
    return [System.Text.Encoding]::ASCII.GetString($bytes.ToArray())
}

while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
        $stream = $client.GetStream()
        $raw = Read-HttpRequestLine $stream
        $firstLine = ($raw -split "`r`n")[0]
        $parts = $firstLine -split ' '
        $reqPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
        $reqPath = $reqPath -split '\?' | Select-Object -First 1
        $path = [System.Uri]::UnescapeDataString($reqPath)
        if ($path -eq "/") { $path = "/index.html" }
        $filePath = Join-Path $root ($path.TrimStart("/"))

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $ct = $mime[$ext]
            if (-not $ct) { $ct = "application/octet-stream" }
            $bodyBytes = [System.IO.File]::ReadAllBytes($filePath)
            $headers = "HTTP/1.1 200 OK`r`nContent-Type: $ct`r`nContent-Length: $($bodyBytes.Length)`r`nCache-Control: no-store, no-cache, must-revalidate`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bodyBytes, 0, $bodyBytes.Length)
        } else {
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
            $headers = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($msg.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($msg, 0, $msg.Length)
        }
        $stream.Flush()
    } catch {
        # игнорируем оборванные соединения и т.п.
    } finally {
        $client.Close()
    }
}
