#Requires -Version 7.0
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$legalRoot = Join-Path $repoRoot 'docs/legal'
$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('rozaya-legal-test-' + [guid]::NewGuid().ToString('N'))
$passed = 0
$failed = 0

function Assert-True {
    param([bool] $Condition, [string] $Message)
    if (-not $Condition) {
        throw $Message
    }
}

function Assert-Throws {
    param([scriptblock] $Action, [string[]] $Expected)
    $message = $null
    try {
        & $Action | Out-Null
    }
    catch {
        $message = $_.Exception.Message
    }
    if ($null -eq $message) {
        throw 'Expected a terminating error, but generation succeeded.'
    }
    foreach ($fragment in $Expected) {
        Assert-True -Condition $message.Contains($fragment) -Message "Expected error containing '$fragment'; got: $message"
    }
}

function Invoke-TestCase {
    param([string] $Name, [scriptblock] $Body)
    try {
        & $Body
        $script:passed += 1
        Write-Output "PASS: $Name"
    }
    catch {
        $script:failed += 1
        Write-Output "FAIL: $Name -- $($_.Exception.Message)"
    }
}

function New-ValidValues {
    return [ordered]@{
        LEGAL_OPERATOR_NAME = 'Fictional Example Operator'
        SUPPORT_EMAIL = 'support@example.invalid'
        PRIVACY_CONTACT_EMAIL = 'privacy@example.invalid'
        BUSINESS_POSTAL_ADDRESS = '123 Fictional Road, Example City, CA 00000, United States'
        CUSTOMER_SUPPORT_PHONE = '+1 202-555-0100'
        REFUND_POLICY_URL = 'https://example.invalid/policies/refund-policy'
        SHIPPING_POLICY_URL = 'https://example.invalid/policies/shipping-policy'
        PRIVACY_POLICY_URL = 'https://example.invalid/policies/privacy-policy'
        CONTACT_INFORMATION_URL = 'https://example.invalid/policies/contact-information'
        PRIVACY_CHOICES_URL = 'https://example.invalid/privacy-choices'
    }
}

function New-Fixture {
    $root = Join-Path $testRoot ([guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $root | Out-Null
    Copy-Item -LiteralPath (Join-Path $legalRoot 'Generate-LegalDocuments.ps1') -Destination $root
    Copy-Item -LiteralPath (Join-Path $legalRoot 'drafts') -Destination (Join-Path $root 'drafts') -Recurse
    $fixture = [pscustomobject]@{
        Root = $root
        Generator = Join-Path $root 'Generate-LegalDocuments.ps1'
        TokenFile = Join-Path $root 'tokens.local.json'
        Output = Join-Path $root 'final'
        Drafts = Join-Path $root 'drafts'
    }
    New-ValidValues | ConvertTo-Json | Set-Content -LiteralPath $fixture.TokenFile -Encoding utf8NoBOM
    return $fixture
}

function Invoke-Generation {
    param($Fixture)
    & $Fixture.Generator -TokenFile $Fixture.TokenFile -OutputDirectory $Fixture.Output -Reviewed -WarningAction SilentlyContinue | Out-Null
}

function Assert-NoOutput {
    param($Fixture)
    Assert-True -Condition (-not (Test-Path -LiteralPath $Fixture.Output)) -Message 'A failed generation created an output directory.'
    $staging = @(Get-ChildItem -LiteralPath $Fixture.Root -Directory -Filter '.legal-*')
    Assert-True -Condition ($staging.Count -eq 0) -Message 'A staging directory was left behind.'
}

New-Item -ItemType Directory -Path $testRoot | Out-Null
try {
    Invoke-TestCase 'all missing values are reported together; example mapping covers real templates' {
        $fixture = New-Fixture
        Copy-Item -LiteralPath (Join-Path $legalRoot 'tokens.example.json') -Destination $fixture.TokenFile -Force
        $expected = @((New-ValidValues).Keys | ForEach-Object { "Missing value: $_." })
        Assert-Throws -Action { Invoke-Generation $fixture } -Expected $expected
        Assert-NoOutput $fixture
    }

    Invoke-TestCase 'review acknowledgment is required before draft notices are removed' {
        $fixture = New-Fixture
        Assert-Throws -Action {
            & $fixture.Generator -TokenFile $fixture.TokenFile -OutputDirectory $fixture.Output
        } -Expected @('pass -Reviewed')
        Assert-NoOutput $fixture
    }

    Invoke-TestCase 'real drafts produce complete dated Markdown, Shopify HTML, and UTF-8 previews' {
        $fixture = New-Fixture
        $today = (Get-Date).ToString('yyyy-MM-dd')
        Invoke-Generation $fixture
        $files = @(Get-ChildItem -LiteralPath $fixture.Output -File)
        Assert-True -Condition ($files.Count -eq 6) -Message 'Expected three files for each of two policies.'
        foreach ($name in @('terms-of-service', 'privacy-policy')) {
            $markdown = Get-Content -LiteralPath (Join-Path $fixture.Output "$name.md") -Raw -Encoding utf8
            $html = Get-Content -LiteralPath (Join-Path $fixture.Output "$name.html") -Raw -Encoding utf8
            $preview = Get-Content -LiteralPath (Join-Path $fixture.Output "$name.preview.html") -Raw -Encoding utf8
            Assert-True -Condition $markdown.Contains("**Effective date:** $today") -Message 'Effective date was not inferred from today.'
            Assert-True -Condition ($markdown -notmatch '\{\{|\}\}|REVIEW-ONLY|NOT APPROVED|review-notes\.md') -Message 'Draft artifacts remain.'
            Assert-True -Condition ($html -match '<h1[^>]*>') -Message 'Markdown was not rendered into HTML.'
            Assert-True -Condition (-not $html.Contains('<html')) -Message 'Shopify output must be a body fragment.'
            Assert-True -Condition $preview.Contains('<meta charset="utf-8">') -Message 'Preview is missing UTF-8 metadata.'
            Assert-True -Condition ($preview.Contains($html)) -Message 'Preview and Shopify body diverged.'
            Assert-True -Condition $html.Contains('https://example.invalid/policies/contact-information') -Message 'Shared policy URL was not resolved.'
        }
        $terms = Get-Content -LiteralPath (Join-Path $fixture.Output 'terms-of-service.html') -Raw -Encoding utf8
        $privacy = Get-Content -LiteralPath (Join-Path $fixture.Output 'privacy-policy.html') -Raw -Encoding utf8
        Assert-True -Condition ([regex]::Matches($terms, '<h2[^>]*>\d+\.').Count -eq 25) -Message 'Terms sections were lost.'
        Assert-True -Condition ([regex]::Matches($privacy, '<h2[^>]*>\d+\.').Count -eq 12) -Message 'Privacy sections were lost.'
        Assert-True -Condition $privacy.Contains('https://example.invalid/privacy-choices') -Message 'Privacy choices link is not absolute.'
    }

    Invoke-TestCase 'personal values remain literal, not HTML, Markdown, or replacement syntax' {
        $fixture = New-Fixture
        $values = New-ValidValues
        $values.LEGAL_OPERATOR_NAME = '<script>alert("x")</script> & [legal] *literal* $1 ${who}'
        $values.BUSINESS_POSTAL_ADDRESS = 'Fictional caf' + [char]0x00E9 + ', $42 & Suite [A]'
        $values | ConvertTo-Json | Set-Content -LiteralPath $fixture.TokenFile -Encoding utf8NoBOM
        Invoke-Generation $fixture
        $html = Get-Content -LiteralPath (Join-Path $fixture.Output 'privacy-policy.html') -Raw -Encoding utf8
        Assert-True -Condition ($html -notmatch '(?i)<script[\s>]') -Message 'A token value became executable markup.'
        foreach ($literal in @('&lt;script&gt;', '&amp;', '[legal]', '*literal*', '$1', '${who}', '$42', '[A]')) {
            Assert-True -Condition $html.Contains($literal) -Message "Literal text was corrupted: $literal"
        }
        $expectedAccent = 'caf' + [char]0x00E9
        $decodedHtml = [System.Net.WebUtility]::HtmlDecode($html)
        Assert-True -Condition $decodedHtml.Contains($expectedAccent) -Message 'Unicode text was corrupted.'
    }

    Invoke-TestCase 'unknown and manually configured date tokens are rejected' {
        $fixture = New-Fixture
        $values = New-ValidValues
        $values['EFFECTIVE_DATE'] = '1900-01-01'
        $values['TYPO'] = 'incorrect'
        $values | ConvertTo-Json | Set-Content -LiteralPath $fixture.TokenFile -Encoding utf8NoBOM
        Assert-Throws -Action { Invoke-Generation $fixture } -Expected @('EFFECTIVE_DATE must not be configured', 'Unknown token name: TYPO')
        Assert-NoOutput $fixture
    }

    Invoke-TestCase 'case-sensitive token names, blank strings, and non-string values fail' {
        foreach ($mode in @('case', 'blank', 'number')) {
            $fixture = New-Fixture
            $values = New-ValidValues
            if ($mode -eq 'case') {
                $values.Remove('SUPPORT_EMAIL')
                $values['support_email'] = 'support@example.invalid'
                $expected = 'Unknown token name: support_email'
            }
            elseif ($mode -eq 'blank') {
                $values.SUPPORT_EMAIL = '   '
                $expected = 'Missing value: SUPPORT_EMAIL'
            }
            else {
                $values.SUPPORT_EMAIL = 123
                $expected = 'must have a string value'
            }
            $values | ConvertTo-Json | Set-Content -LiteralPath $fixture.TokenFile -Encoding utf8NoBOM
            Assert-Throws -Action { Invoke-Generation $fixture } -Expected @($expected)
            Assert-NoOutput $fixture
        }
    }

    Invoke-TestCase 'missing, malformed, non-object and duplicate JSON token files fail' {
        foreach ($mode in @('missing', 'invalid', 'array', 'duplicate')) {
            $fixture = New-Fixture
            if ($mode -eq 'missing') {
                Remove-Item -LiteralPath $fixture.TokenFile
                $expected = 'Token file not found'
            }
            elseif ($mode -eq 'invalid') {
                Set-Content -LiteralPath $fixture.TokenFile -Value '{not json}'
                $expected = 'not valid JSON'
            }
            elseif ($mode -eq 'array') {
                Set-Content -LiteralPath $fixture.TokenFile -Value '[]'
                $expected = 'must be a JSON object'
            }
            else {
                $json = (New-ValidValues | ConvertTo-Json).TrimEnd().TrimEnd('}') + ', "SUPPORT_EMAIL": "duplicate@example.invalid"}'
                Set-Content -LiteralPath $fixture.TokenFile -Value $json
                $expected = 'Duplicate token name: SUPPORT_EMAIL'
            }
            Assert-Throws -Action { Invoke-Generation $fixture } -Expected @($expected)
            Assert-NoOutput $fixture
        }
    }

    Invoke-TestCase 'URLs reject relative paths, HTTP, credentials, whitespace and preview services' {
        foreach ($url in @('/privacy-choices', 'http://example.invalid/privacy', 'javascript:alert(1)', 'https://user:password@example.invalid/privacy', 'https://example.invalid/a b', 'https://markdownlivepreview.com/test')) {
            $fixture = New-Fixture
            $values = New-ValidValues
            $values.PRIVACY_CHOICES_URL = $url
            $values | ConvertTo-Json | Set-Content -LiteralPath $fixture.TokenFile -Encoding utf8NoBOM
            Assert-Throws -Action { Invoke-Generation $fixture } -Expected @('Token validation failed')
            Assert-NoOutput $fixture
        }
    }

    Invoke-TestCase 'URL parentheses are escaped without breaking query strings or fragments' {
        $fixture = New-Fixture
        $values = New-ValidValues
        $values.PRIVACY_CHOICES_URL = 'https://example.invalid/privacy(choices)?a=1&b=2#data-sharing'
        $values | ConvertTo-Json | Set-Content -LiteralPath $fixture.TokenFile -Encoding utf8NoBOM
        Invoke-Generation $fixture
        $html = Get-Content -LiteralPath (Join-Path $fixture.Output 'privacy-policy.html') -Raw -Encoding utf8
        Assert-True -Condition $html.Contains('privacy%28choices%29?a=1&amp;b=2#data-sharing') -Message 'URL structure was corrupted.'
    }

    Invoke-TestCase 'multiline values and nested placeholders are rejected' {
        foreach ($value in @("Line one`nLine two", '{{SUPPORT_EMAIL}}', '%7B%7BSUPPORT_EMAIL%7D%7D')) {
            $fixture = New-Fixture
            $values = New-ValidValues
            $values.LEGAL_OPERATOR_NAME = $value
            $values | ConvertTo-Json | Set-Content -LiteralPath $fixture.TokenFile -Encoding utf8NoBOM
            Assert-Throws -Action { Invoke-Generation $fixture } -Expected @('Token validation failed')
            Assert-NoOutput $fixture
        }
    }

    Invoke-TestCase 'existing output is preserved instead of overwritten' {
        $fixture = New-Fixture
        New-Item -ItemType Directory -Path $fixture.Output | Out-Null
        $sentinel = Join-Path $fixture.Output 'existing.txt'
        Set-Content -LiteralPath $sentinel -Value 'Keep this approved snapshot.'
        Assert-Throws -Action { Invoke-Generation $fixture } -Expected @('Output directory already exists')
        Assert-True -Condition ((Get-Content -LiteralPath $sentinel) -ceq 'Keep this approved snapshot.') -Message 'An existing snapshot was changed.'
        Assert-True -Condition (@(Get-ChildItem -LiteralPath $fixture.Output).Count -eq 1) -Message 'Existing output was partially overwritten.'
    }

    Invoke-TestCase 'unknown/malformed draft tokens and missing review markers fail before output' {
        foreach ($mode in @('unknown', 'malformed', 'marker')) {
            $fixture = New-Fixture
            $path = Join-Path $fixture.Drafts 'terms-of-service.md'
            if ($mode -eq 'unknown') {
                Add-Content -LiteralPath $path -Value '{{NEW_REQUIRED_TOKEN}}'
                $expected = 'Missing value: NEW_REQUIRED_TOKEN'
            }
            elseif ($mode -eq 'malformed') {
                Add-Content -LiteralPath $path -Value '{{wrong casing}}'
                $expected = 'malformed token syntax'
            }
            else {
                $content = (Get-Content -LiteralPath $path -Raw).Replace('<!-- REVIEW-ONLY:END -->', '')
                Set-Content -LiteralPath $path -Value $content
                $expected = 'exactly one paired REVIEW-ONLY block'
            }
            Assert-Throws -Action { Invoke-Generation $fixture } -Expected @($expected)
            Assert-NoOutput $fixture
        }
    }

    Invoke-TestCase 'bad links in the second policy cannot produce a partial output set' {
        $fixture = New-Fixture
        Add-Content -LiteralPath (Join-Path $fixture.Drafts 'terms-of-service.md') -Value '[Broken relative link](/not-a-public-host)'
        Assert-Throws -Action { Invoke-Generation $fixture } -Expected @('non-HTTPS or relative link')
        Assert-NoOutput $fixture
    }

    Invoke-TestCase 'relative output paths resolve from the PowerShell working directory' {
        $fixture = New-Fixture
        Push-Location -LiteralPath $fixture.Root
        try {
            & $fixture.Generator -TokenFile $fixture.TokenFile -OutputDirectory 'relative-final' -Reviewed -WarningAction SilentlyContinue | Out-Null
        }
        finally {
            Pop-Location
        }
        Assert-True -Condition (Test-Path -LiteralPath (Join-Path $fixture.Root 'relative-final/privacy-policy.html')) -Message 'Output was written under the wrong working directory.'
    }
}
finally {
    Remove-Item -LiteralPath $testRoot -Recurse -Force
}

Write-Output "Legal generation tests: $passed passed, $failed failed."
if ($failed -gt 0) {
    throw 'Legal generation regression tests failed.'
}
