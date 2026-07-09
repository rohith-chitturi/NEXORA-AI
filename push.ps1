$message = $args[0]
if (-not $message) {
    $message = "update"
}
git add .
git commit -m $message
git push
