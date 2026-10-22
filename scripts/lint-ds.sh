#!/usr/bin/env bash
# Lint do design system: bloqueia hex, tamanhos arbitrários e famílias de cor proibidas fora de src/components/ui.
# Uso: npm run lint:ds  (sai com 1 se encontrar violações)
set -u
cd "$(dirname "$0")/.."
fail=0
check() { # $1 = descrição, $2 = regex (ERE), $3 = include glob
  local out
  out=$(grep -rnE --include="$3" "$2" src 2>/dev/null | grep -v 'src/components/ui/' | grep -v 'src/styles/palette.css' | grep -vE '^\S+:\s*//' )
  if [ -n "$out" ]; then
    echo "✗ $1"; echo "$out" | sed 's/^/    /' | head -40
    local n; n=$(echo "$out" | wc -l); [ "$n" -gt 40 ] && echo "    … e mais $((n-40))"
    fail=1
  else
    echo "✓ $1"
  fi
}
check "sem hex em .ts/.tsx"                      '#[0-9a-fA-F]{6}\b'                                   '*.ts*'
check "sem cor arbitrária (text-[#…], bg-[#…])"   '\b(text|bg|border|ring|from|to|via)-\[#'             '*.tsx'
check "sem tamanho de fonte arbitrário"           '\btext-\[[0-9.]+(px|rem)\]'                           '*.tsx'
check "sem radius arbitrário"                     '\brounded-\[[^]]+\]'                                 '*.tsx'
check "sem famílias de cor desligadas"            '\b(bg|text|border|ring|from|to|via|fill|stroke|divide|outline|accent|shadow)-(slate|zinc|gray|stone|indigo|red|rose|green|sky|teal|orange|yellow|lime|purple|fuchsia|pink)-[0-9]+' '*.tsx'
check "sem --dupply-brand-* (deprecated)"         'dupply-brand-'                                        '*.ts*'
exit $fail
