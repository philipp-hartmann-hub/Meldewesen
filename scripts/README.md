# Word-Übergabedokument erzeugen

Erzeugt `../docs/A2_eMeldewesen_UEBERGABE.docx` aus `generate-uebergabe-docx.mjs` und `document-summaries.mjs` (Kurzfassungen aller Projektdokumente in Kap. 9).

```powershell
cd docs/meldewesen-a2-main/scripts
npm install
node generate-uebergabe-docx.mjs
```

Kopie für das Repository-Root-`docs/`:

```powershell
Copy-Item ..\docs\A2_eMeldewesen_UEBERGABE.docx ..\..\..\docs\A2_eMeldewesen_UEBERGABE.docx
```

Nach inhaltlichen Änderungen an der Roadmap oder am Validierungsstand: Skript anpassen oder `UEBERGABE_GESAMT.md` §13 als Referenz nutzen und Word neu erzeugen.
