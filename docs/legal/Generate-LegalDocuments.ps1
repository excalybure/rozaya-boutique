#Requires -Version 7.0
<#
.SYNOPSIS
Resolves reviewed legal templates into local Markdown and HTML files. Never uploads.
.DESCRIPTION
Fill tokens.local.json from tokens.example.json. EFFECTIVE_DATE is generated once
from today's date on this machine. -Reviewed confirms review of text and values;
it is not legal approval or proof that operational publication gates have passed.
.EXAMPLE
pwsh -NoProfile -File ./docs/legal/Generate-LegalDocuments.ps1 -Reviewed
#>
[CmdletBinding()]
param(
    [string] $TokenFile = (Join-Path $PSScriptRoot 'tokens.local.json'),
    [string] $OutputDirectory = (Join-Path $PSScriptRoot 'final'),
    [switch] $Reviewed
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-DraftDocuments {
    $files = @(Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'drafts') -Filter '*.md' -File | Sort-Object Name)
    if ($files.Count -eq 0) {
        throw 'No Markdown drafts were found.'
    }
    foreach ($file in $files) {
        $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding utf8
        $start = '<!-- REVIEW-ONLY:START -->'
        $end = '<!-- REVIEW-ONLY:END -->'
        $blockPattern = '(?ms)^' + [regex]::Escape($start) + '\r?\n.*?^' + [regex]::Escape($end) + '(?:\r?\n|$)'
        $validReviewBlock = [regex]::Matches($content, [regex]::Escape($start)).Count -eq 1 -and
            [regex]::Matches($content, [regex]::Escape($end)).Count -eq 1 -and
            [regex]::Matches($content, $blockPattern).Count -eq 1
        if (-not $validReviewBlock) {
            throw "Draft '$($file.Name)' needs exactly one paired REVIEW-ONLY block."
        }
        $publicationText = [regex]::Replace($content, $blockPattern, '')
        $tokens = [regex]::Matches($publicationText, '\{\{([A-Z][A-Z0-9_]*)\}\}')
        $withoutTokens = [regex]::Replace($publicationText, '\{\{([A-Z][A-Z0-9_]*)\}\}', '')
        if ($withoutTokens.Contains('{{') -or $withoutTokens.Contains('}}')) {
            throw "Draft '$($file.Name)' has malformed token syntax. Use {{UPPER_SNAKE_CASE}}."
        }
        [pscustomobject]@{
            Name = $file.BaseName
            Markdown = $publicationText
            Tokens = @($tokens | ForEach-Object { $_.Groups[1].Value })
        }
    }
}

function Read-TokenValues {
    param([string] $Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw 'Token file not found. Copy tokens.example.json to tokens.local.json and fill the approved values.'
    }
    $json = Get-Content -LiteralPath $Path -Raw -Encoding utf8
    try {
        $document = [System.Text.Json.JsonDocument]::Parse($json)
    }
    catch [System.Text.Json.JsonException] {
        throw 'Token file is not valid JSON. No documents were generated.'
    }
    try {
        if ($document.RootElement.ValueKind -ne [System.Text.Json.JsonValueKind]::Object) {
            throw 'Token file must be a JSON object with token names and string values.'
        }
        $values = [System.Collections.Generic.Dictionary[string, string]]::new([System.StringComparer]::Ordinal)
        foreach ($property in $document.RootElement.EnumerateObject()) {
            if ($values.ContainsKey($property.Name)) {
                throw "Duplicate token name: $($property.Name)."
            }
            if ($property.Value.ValueKind -ne [System.Text.Json.JsonValueKind]::String) {
                throw "Token '$($property.Name)' must have a string value."
            }
            $values.Add($property.Name, $property.Value.GetString())
        }
        return $values
    }
    finally {
        $document.Dispose()
    }
}

function Get-ValidatedValues {
    param($Drafts, $Values, [string] $EffectiveDate)
    $requiredNames = @($Drafts.Tokens | Sort-Object -Unique | Where-Object { $_ -cne 'EFFECTIVE_DATE' })
    $problems = [System.Collections.Generic.List[string]]::new()
    foreach ($name in $Values.Keys) {
        if ($name -ceq 'EFFECTIVE_DATE') {
            $problems.Add('EFFECTIVE_DATE must not be configured; it comes from today''s date.')
        }
        elseif ($requiredNames -cnotcontains $name) {
            $problems.Add("Unknown token name: $name.")
        }
    }
    foreach ($name in $requiredNames) {
        if (-not $Values.ContainsKey($name) -or [string]::IsNullOrWhiteSpace($Values[$name])) {
            $problems.Add("Missing value: $name.")
            continue
        }
        $value = $Values[$name].Trim()
        $invalidContent = $value -match '[\p{Cc}\u2028\u2029]' -or
            $value -match '(?i)\{\{|\}\}|%7b%7b|%7d%7d|markdownlivepreview\.com'
        if ($invalidContent) {
            $problems.Add("Token '$name' contains a line break, control character, unresolved token, or preview-site reference.")
            continue
        }
        if ($name.EndsWith('_URL', [System.StringComparison]::Ordinal)) {
            $uri = $null
            $validUrl = [uri]::TryCreate($value, [System.UriKind]::Absolute, [ref] $uri) -and
                $uri.Scheme -ceq 'https' -and $uri.Host -ne '' -and $uri.UserInfo -eq '' -and
                $value -notmatch '\s'
            if (-not $validUrl) {
                $problems.Add("Token '$name' must be an absolute HTTPS URL without credentials or whitespace.")
                continue
            }
            $value = $uri.AbsoluteUri.Replace('(', '%28').Replace(')', '%29')
        }
        $Values[$name] = $value
    }
    if ($problems.Count -gt 0) {
        throw ("Token validation failed; no documents were generated:`n - " + ($problems -join "`n - "))
    }
    $Values.Add('EFFECTIVE_DATE', $EffectiveDate)
    return $Values
}

function ConvertTo-MarkdownValue {
    param([string] $Name, [string] $Value)
    if ($Name -ceq 'EFFECTIVE_DATE' -or $Name.EndsWith('_URL', [System.StringComparison]::Ordinal)) {
        return $Value
    }
    # Values are literal data, not Markdown, HTML, or regex replacement expressions.
    $escaped = [regex]::Replace($Value, '[\\`*_{}\[\]()#+\-.!|]', [System.Text.RegularExpressions.MatchEvaluator] {
        param($match)
        return '\' + $match.Value
    })
    # Encode last so numeric entities (for example accented names) remain intact.
    return [System.Net.WebUtility]::HtmlEncode($escaped)
}

function Get-FinalDocuments {
    param($Drafts, $Values)
    foreach ($draft in $Drafts) {
        $resolved = [regex]::Replace($draft.Markdown, '\{\{([A-Z][A-Z0-9_]*)\}\}', [System.Text.RegularExpressions.MatchEvaluator] {
            param($match)
            $name = $match.Groups[1].Value
            return ConvertTo-MarkdownValue -Name $name -Value $Values[$name]
        })
        if ($resolved -match '(?i)\{\{|\}\}|%7b%7b|%7d%7d|REVIEW-ONLY|markdownlivepreview\.com') {
            throw "Draft '$($draft.Name)' still contains a template artifact. No documents were generated."
        }
        $html = (ConvertFrom-Markdown -InputObject $resolved).Html
        # Relative links work locally but would point at Shopify's host after installation.
        $links = [regex]::Matches($html, '(?i)\bhref="([^"]*)"')
        foreach ($link in $links) {
            $href = $link.Groups[1].Value
            $allowedLink = $href.StartsWith('https://', [System.StringComparison]::OrdinalIgnoreCase) -or
                $href.StartsWith('#', [System.StringComparison]::Ordinal)
            if (-not $allowedLink) {
                throw "Draft '$($draft.Name)' has a non-HTTPS or relative link. Use an absolute HTTPS token value."
            }
        }
        $title = [System.Net.WebUtility]::HtmlEncode($draft.Name)
        $preview = "<!doctype html>`n<html lang=`"en`">`n<head><meta charset=`"utf-8`"><title>$title</title></head>`n<body>`n$html`n</body>`n</html>`n"
        [pscustomobject]@{ Name = $draft.Name; Markdown = $resolved; Html = $html; Preview = $preview }
    }
}

function Write-FinalDocuments {
    param($Documents, [string] $Destination)
    $parent = Split-Path -Parent $Destination
    if (Test-Path -LiteralPath $Destination) {
        throw 'Output directory already exists. Choose a new -OutputDirectory; existing files are never overwritten.'
    }
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
        throw 'The output parent directory must already exist.'
    }
    $staging = Join-Path $parent ('.legal-' + [guid]::NewGuid().ToString('N'))
    $utf8 = [System.Text.UTF8Encoding]::new($false)
    try {
        New-Item -ItemType Directory -Path $staging | Out-Null
        foreach ($document in $Documents) {
            [System.IO.File]::WriteAllText((Join-Path $staging ($document.Name + '.md')), $document.Markdown, $utf8)
            [System.IO.File]::WriteAllText((Join-Path $staging ($document.Name + '.html')), $document.Html, $utf8)
            [System.IO.File]::WriteAllText((Join-Path $staging ($document.Name + '.preview.html')), $document.Preview, $utf8)
        }
        # Same-parent rename fails if the destination appeared concurrently; no partial set or overwrite.
        [System.IO.Directory]::Move($staging, $Destination)
    }
    finally {
        if (Test-Path -LiteralPath $staging) {
            Remove-Item -LiteralPath $staging -Recurse -Force
        }
    }
}

$drafts = @(Get-DraftDocuments)
$effectiveDate = (Get-Date).ToString('yyyy-MM-dd', [System.Globalization.CultureInfo]::InvariantCulture)
$values = Get-ValidatedValues -Drafts $drafts -Values (Read-TokenValues -Path $TokenFile) -EffectiveDate $effectiveDate
if (-not $Reviewed) {
    throw 'Review the policy text, token values, and publication gates first. Then pass -Reviewed to generate files without draft notices.'
}
$documents = @(Get-FinalDocuments -Drafts $drafts -Values $values)
$destination = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputDirectory)
Write-FinalDocuments -Documents $documents -Destination $destination
Write-Output "Generated $($documents.Count) policies in: $destination"
Write-Output "Effective date: $effectiveDate (this machine's local date). Nothing was uploaded or published."
Write-Warning 'Generation is not legal approval. Review the HTML and remaining launch gates before publishing.'
