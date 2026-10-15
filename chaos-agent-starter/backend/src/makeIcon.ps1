Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\Desktop\chaos\chaos-agent-starter\frontend\public\jarvis-logo.png"
$icoPath = "C:\Users\Admin\Desktop\chaos\chaos-agent-starter\frontend\public\jarvis.ico"
$desktop = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
$desktopIcoPath = [System.IO.Path]::Combine($desktop, "jarvis.ico")

if (-not (Test-Path $srcPath)) {
    Write-Error "Source PNG not found at $srcPath"
    exit 1
}

$src = [System.Drawing.Image]::FromFile($srcPath)
$targetSize = 256
$bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, 0, 0, $targetSize, $targetSize)
$g.Dispose()
$src.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $ms.ToArray()
$ms.Dispose()
$bmp.Dispose()

function Save-IcoFile($outPath, $bytes) {
    $fs = [System.IO.File]::Create($outPath)
    $bw = New-Object System.IO.BinaryWriter($fs)

    # ICONHEADER (6 bytes)
    $bw.Write([UInt16]0) # Reserved
    $bw.Write([UInt16]1) # Type 1 = Icon
    $bw.Write([UInt16]1) # Count = 1

    # ICONDIRENTRY (16 bytes)
    $bw.Write([Byte]0) # Width (0 = 256)
    $bw.Write([Byte]0) # Height (0 = 256)
    $bw.Write([Byte]0) # Colors
    $bw.Write([Byte]0) # Reserved
    $bw.Write([UInt16]1) # Planes
    $bw.Write([UInt16]32) # Bits per pixel
    $bw.Write([UInt32]$bytes.Length) # Image size
    $bw.Write([UInt32]22) # Image offset (6 + 16 = 22)

    # Write PNG bytes
    $bw.Write($bytes)
    $bw.Flush()
    $fs.Close()
}

Save-IcoFile $icoPath $pngBytes
Save-IcoFile $desktopIcoPath $pngBytes

# Apply icon to both hyphens and em-dashes shortcuts if they exist
$batPath = [System.IO.Path]::Combine($desktop, "Launch JARVIS.bat")
$shortcutNames = @(
    "JARVIS - The Time Traveller.lnk",
    "JARVIS -- The Time Traveller.lnk",
    "JARVIS The Time Traveller.lnk"
)

# Also check for any existing .lnk matching *JARVIS*
$existingLnks = Get-ChildItem -Path $desktop -Filter "*JARVIS*.lnk" -ErrorAction SilentlyContinue

$w = New-Object -ComObject WScript.Shell

if ($existingLnks) {
    foreach ($item in $existingLnks) {
        $s = $w.CreateShortcut($item.FullName)
        $s.TargetPath = $batPath
        $s.WorkingDirectory = "C:\Users\Admin\Desktop\chaos"
        $s.IconLocation = "$icoPath,0"
        $s.Description = "JARVIS - The Time Traveller Autonomous AI Workspace"
        $s.Save()
        Write-Output "UPDATED_EXISTING_LNK: $($item.FullName)"
    }
}

# Create primary standard shortcut
$primaryLnk = [System.IO.Path]::Combine($desktop, "JARVIS - The Time Traveller.lnk")
$s = $w.CreateShortcut($primaryLnk)
$s.TargetPath = $batPath
$s.WorkingDirectory = "C:\Users\Admin\Desktop\chaos"
$s.IconLocation = "$icoPath,0"
$s.Description = "JARVIS - The Time Traveller Autonomous AI Workspace"
$s.Save()

# Update .URL file icon
$urlFiles = Get-ChildItem -Path $desktop -Filter "*JARVIS*.url" -ErrorAction SilentlyContinue
foreach ($u in $urlFiles) {
    $urlContent = "[InternetShortcut]`r`nURL=http://localhost:5173/`r`nIconFile=$icoPath`r`nIconIndex=0`r`n"
    [System.IO.File]::WriteAllText($u.FullName, $urlContent, [System.Text.Encoding]::UTF8)
    Write-Output "UPDATED_URL: $($u.FullName)"
}

Write-Output "SUCCESS: jarvis.ico applied to all desktop shortcuts"
