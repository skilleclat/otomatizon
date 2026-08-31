Add-Type -AssemblyName System.Drawing

$inputPath = "$PSScriptRoot\..\public\logo.png"
$fullCropPath = "$PSScriptRoot\..\public\logo.png"
$markCropPath = "$PSScriptRoot\..\public\logo-mark.png"

$bmp = New-Object System.Drawing.Bitmap($inputPath)
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Full logo bounding box: X=$minX..$maxX, Y=$minY..$maxY, W=$($maxX - $minX + 1), H=$($maxY - $minY + 1)"

# Add subtle margin around bounding box (10px)
$pad = 12
$cropX = [Math]::Max(0, $minX - $pad)
$cropY = [Math]::Max(0, $minY - $pad)
$cropW = [Math]::Min($bmp.Width - $cropX, ($maxX - $minX + 1) + ($pad * 2))
$cropH = [Math]::Min($bmp.Height - $cropY, ($maxY - $minY + 1) + ($pad * 2))

# 1. Crop full logo (mark + text)
$rectFull = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$croppedFull = $bmp.Clone($rectFull, $bmp.PixelFormat)

# Make background transparent if it's white (#FFF)
$croppedFull.MakeTransparent([System.Drawing.Color]::FromArgb(255, 255, 255))

$tempFullPath = "$PSScriptRoot\..\public\logo-cropped.png"
$croppedFull.Save($tempFullPath, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedFull.Dispose()

# 2. Crop just the mark icon
# The mark is on the left side: from minX to roughly the start of the 'O' of 'Otomatizon'
# Let's find where the gap between mark and text is around X = minX + 220
$markW = [int]($cropH * 1.1)
$rectMark = New-Object System.Drawing.Rectangle($cropX, $cropY, [Math]::Min($markW, $cropW), $cropH)
$croppedMark = $bmp.Clone($rectMark, $bmp.PixelFormat)
$croppedMark.MakeTransparent([System.Drawing.Color]::FromArgb(255, 255, 255))
$tempMarkPath = "$PSScriptRoot\..\public\logo-mark.png"
$croppedMark.Save($tempMarkPath, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedMark.Dispose()

$bmp.Dispose()

# Replace public/logo.png with the tightly cropped transparent PNG
Move-Item -Path $tempFullPath -Destination $inputPath -Force
Write-Host "Successfully cropped logo.png and generated logo-mark.png!"
