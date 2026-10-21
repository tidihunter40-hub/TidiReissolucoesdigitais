"""Static checks for the TidiReis site; run with `python verify_site.py`."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re

from PIL import Image


ROOT = Path(__file__).parent


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.refs = []
        self.tabs = []
        self.sections = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if "id" in data:
            self.ids.append(data["id"])
        if tag == "section":
            self.sections.append(data.get("id"))
        if data.get("role") == "tab":
            self.tabs.append(data)
        for attr in ("href", "src"):
            if data.get(attr):
                self.refs.append(data[attr])


def cnpj_valid(number):
    digits = [int(value) for value in re.sub(r"\D", "", number)]
    if len(digits) != 14 or len(set(digits)) == 1:
        return False

    def check(values, weights):
        result = 11 - sum(a * b for a, b in zip(values, weights)) % 11
        return 0 if result >= 10 else result

    return (digits[12] == check(digits[:12], [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
            and digits[13] == check(digits[:13], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]))


def main():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "TidiReis Soluções Digitais" in html
    assert "nexus" not in html.lower()
    document = Document()
    document.feed(html)
    counts = Counter(document.ids)
    assert not [key for key, value in counts.items() if value > 1], "Duplicate HTML id"
    for reference in document.refs:
        if reference.startswith("#"):
            assert reference[1:] in counts, f"Missing anchor: {reference}"
        elif not re.match(r"^[a-z][a-z0-9+.-]*:", reference):
            assert (ROOT / reference.split("?", 1)[0]).exists(), f"Missing asset: {reference}"
    assert 'id="studioWorkspace"' in html and 'id="studioFrame"' in html
    assert 'id="studioLogo"' in html and 'id="studioSegments"' in html and 'id="studioStyles"' in html
    assert all((ROOT / name).is_file() for name in ("studio.css", "studio.js", "studio-data.js", "studio-colors.js", "studio-preview.html", "studio-preview.css", "studio-preview.js"))
    studio_photos = list((ROOT / "assets/studio").glob("*.webp"))
    assert len(studio_photos) >= 42
    for photo in studio_photos:
        with Image.open(photo) as image:
            assert image.format == "WEBP" and image.width >= 500 and image.height >= 300
    assert 'id="labGroups"' in html and 'id="labSelection"' in html
    assert 'id="labFrame"' in html and 'id="labFullscreen"' in html
    lab_data = (ROOT / "lab-data.js").read_text(encoding="utf-8")
    assert len(re.findall(r"\{id:'[a-z]+',group:", lab_data)) == 13
    assert all((ROOT / name).is_file() for name in ("lab-experience.html", "lab-experience.css", "lab-experience.js", "lab-fixtures.js", "lab.js", "lab.css"))
    assert 'id="portfolioGrid"' in html and 'id="portfolioFilters"' in html
    assert 'id="portfolioDialog"' in html
    projects = json.loads((ROOT / "portfolio-projects.json").read_text(encoding="utf-8"))
    assert len(projects) == 12
    assert len({project["id"] for project in projects}) == 12
    assert all(project["url"].startswith("https://") for project in projects)
    report = json.loads((ROOT / "public/portfolio/relatorio.json").read_text(encoding="utf-8"))["projects"]
    assert set(report) == {project["id"] for project in projects}
    for project in projects:
        entry = report[project["id"]]
        assert entry["url"] == project["url"]
        for device, expected_size in (("desktop", (1440, 900)), ("mobile", (390, 844))):
            capture = entry[device]
            if not capture["ok"]:
                assert capture.get("error"), f"Missing error note: {project['id']} {device}"
                continue
            image_path = ROOT / capture["file"]
            assert image_path.is_file(), f"Missing portfolio image: {image_path}"
            with Image.open(image_path) as image:
                assert image.format == "WEBP" and image.size == expected_size
    assert len(re.findall(r'class="service-card', html)) == 6
    assert len(re.findall(r'name="service"', html)) == 8
    assert cnpj_valid("69.340.664/0001-04")

    manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
    assert manifest["display"] == "standalone"
    sizes = set()
    for icon in manifest["icons"]:
        path = ROOT / icon["src"]
        assert path.exists()
        with Image.open(path) as image:
            size = f"{image.width}x{image.height}"
            assert size == icon["sizes"]
            sizes.add(size)
    assert {"192x192", "512x512"}.issubset(sizes)
    shortcuts = {"#" + item["url"].split("#", 1)[-1] for item in manifest.get("shortcuts", [])}
    assert {"#servicos", "#tecnologia", "#orcamento", "#contato"}.issubset(shortcuts)
    maskable = [icon for icon in manifest["icons"] if icon.get("purpose") == "maskable"]
    assert maskable, "Missing maskable icon"
    with Image.open(ROOT / maskable[0]["src"]) as image:
        assert image.size == (512, 512)
        assert image.convert("RGB").getpixel((0, 0)) == (2, 8, 23)
        assert image.convert("RGB").getpixel((256, 256)) != (2, 8, 23)
    assert Image.open(ROOT / "assets/og-image.jpg").size == (1200, 630)
    assert (ROOT / "offline.html").exists()
    assert "Você está offline." in (ROOT / "offline.html").read_text(encoding="utf-8")
    assert "Página não encontrada." in (ROOT / "404.html").read_text(encoding="utf-8")
    assert (ROOT / "privacidade.html").exists()
    assert (ROOT / "robots.txt").exists()
    assert (ROOT / "sitemap.xml").exists()
    assert 'https://trdigital.vercel.app/' in html
    assert 'href="finish.css"' in html
    assert 'id="quoteStatus"' in html
    assert 'href="#orcamento">Iniciar meu projeto' in html
    assert "SKIP_WAITING" in (ROOT / "sw.js").read_text(encoding="utf-8")
    assert "Serviço: " in (ROOT / "advanced.js").read_text(encoding="utf-8")
    ignored = set((ROOT / ".vercelignore").read_text(encoding="utf-8").splitlines())
    runtime = list(ROOT.glob("*.html")) + list(ROOT.glob("*.css")) + list(ROOT.glob("*.js")) + [ROOT / "manifest.webmanifest"]
    for source in runtime:
        for asset in set(re.findall(r"assets/[\w/-]+\.(?:webp|png|jpg|svg)", source.read_text(encoding="utf-8"))):
            assert (ROOT / asset).is_file(), f"Missing runtime asset: {asset} ({source.name})"
            assert asset not in ignored, f"Runtime asset excluded from Vercel: {asset}"
    vercel = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
    assert vercel["framework"] is None and vercel["outputDirectory"] == "."
    assert vercel["buildCommand"] == ""
    assert any(header == {"key": "X-Frame-Options", "value": "SAMEORIGIN"}
               for route in vercel["headers"] for header in route["headers"]), "Local previews require same-origin frames"
    print(f"OK: {len(document.sections)} seções, 6 serviços, 12 projetos, 13 demonstrações de laboratório, 8 opções de orçamento, links locais, manifest e CNPJ.")


if __name__ == "__main__":
    main()
