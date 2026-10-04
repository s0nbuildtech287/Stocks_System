import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_svg_logo(output_path):
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0e172a"/>
      <stop offset="70%" stop-color="#070b14"/>
      <stop offset="100%" stop-color="#03050a"/>
    </radialGradient>

    <!-- Primary Emerald/Cyan Cyber Gradient -->
    <linearGradient id="cyberGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>

    <!-- Glowing Accent Gradient -->
    <linearGradient id="neonGlow" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#34d399"/>
    </linearGradient>

    <!-- Gold Accent Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  
  <!-- Outer Tech Border with Rounded Squircle -->
  <rect x="16" y="16" width="480" height="480" rx="98" fill="none" stroke="url(#cyberGreen)" stroke-width="2.5" stroke-opacity="0.35"/>
  <rect x="28" y="28" width="456" height="456" rx="86" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="8 6" stroke-opacity="0.6"/>

  <!-- Background Quantum Grid Nodes -->
  <g opacity="0.15" stroke="#38bdf8" stroke-width="1">
    <line x1="90" y1="160" x2="422" y2="160" stroke-dasharray="4 4"/>
    <line x1="90" y1="256" x2="422" y2="256" stroke-dasharray="4 4"/>
    <line x1="90" y1="352" x2="422" y2="352" stroke-dasharray="4 4"/>
    <line x1="160" y1="90" x2="160" y2="422" stroke-dasharray="4 4"/>
    <line x1="256" y1="90" x2="256" y2="422" stroke-dasharray="4 4"/>
    <line x1="352" y1="90" x2="352" y2="422" stroke-dasharray="4 4"/>
  </g>

  <!-- Ambient Light Center Glow -->
  <circle cx="256" cy="256" r="140" fill="#10b981" opacity="0.08" filter="url(#heavyGlow)"/>

  <!-- Candlestick Graphic Silhouette in Background -->
  <g opacity="0.45">
    <!-- Candle 1 (Red / Dip) -->
    <line x1="130" y1="260" x2="130" y2="380" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="120" y="290" width="20" height="60" rx="4" fill="#f43f5e"/>

    <!-- Candle 2 (Green / Recovery) -->
    <line x1="180" y1="200" x2="180" y2="350" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="170" y="230" width="20" height="85" rx="4" fill="#10b981"/>

    <!-- Candle 3 (Green / Strong Rise) -->
    <line x1="330" y1="130" x2="330" y2="300" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="320" y="160" width="20" height="95" rx="4" fill="#10b981"/>

    <!-- Candle 4 (Cyan / Peak) -->
    <line x1="385" y1="90" x2="385" y2="240" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="375" y="115" width="20" height="80" rx="4" fill="#06b6d4"/>
  </g>

  <!-- Dynamic Ascending Trend Ribbon Wave -->
  <path d="M 100 360 C 160 380, 180 280, 240 260 C 300 240, 340 140, 420 120" 
        fill="none" 
        stroke="url(#neonGlow)" 
        stroke-width="5" 
        stroke-linecap="round" 
        filter="url(#glow)"/>

  <!-- Arrow Indicator on Trend Wave Peak -->
  <polygon points="428,118 402,112 414,136" fill="#34d399" filter="url(#glow)"/>

  <!-- CENTRAL ICONIC MONOGRAM: Interlocking 'S S' Shield Mark -->
  <!-- Upper 'S' Arc -->
  <path d="M 320 170 
           C 320 135, 290 120, 256 120 
           C 210 120, 180 145, 180 185 
           C 180 230, 225 245, 256 256 
           C 290 268, 335 285, 335 330 
           C 335 375, 298 400, 256 400 
           C 215 400, 185 380, 182 345" 
        fill="none" 
        stroke="url(#cyberGreen)" 
        stroke-width="26" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        filter="url(#glow)"/>

  <!-- High-Tech Geometric Slash / Quant Breakout Line -->
  <line x1="165" y1="355" x2="347" y2="165" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" opacity="0.9" filter="url(#glow)"/>

  <!-- Luminous Quantum Node Points -->
  <circle cx="165" cy="355" r="7" fill="#10b981" filter="url(#glow)"/>
  <circle cx="165" cy="355" r="3" fill="#ffffff"/>
  
  <circle cx="256" cy="256" r="8" fill="#38bdf8" filter="url(#glow)"/>
  <circle cx="256" cy="256" r="3.5" fill="#ffffff"/>

  <circle cx="347" cy="165" r="7" fill="#34d399" filter="url(#glow)"/>
  <circle cx="347" cy="165" r="3" fill="#ffffff"/>

  <!-- Corner Tech Accents -->
  <path d="M 45 75 L 45 45 L 75 45" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
  <path d="M 467 75 L 467 45 L 437 45" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
  <path d="M 45 437 L 45 467 L 75 467" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round"/>
  <path d="M 467 437 L 467 467 L 437 467" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
</svg>"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Created SVG logo at {output_path}")

def create_horizontal_svg_logo(output_path):
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" width="100%" height="100%">
  <defs>
    <radialGradient id="hBgGrad" cx="30%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0e172a"/>
      <stop offset="100%" stop-color="#050811"/>
    </radialGradient>
    <linearGradient id="hCyberGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <filter id="hGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="900" height="240" rx="36" fill="url(#hBgGrad)" stroke="#1e293b" stroke-width="1.5"/>

  <!-- Left Icon Mark -->
  <g transform="translate(40, 25) scale(0.37)">
    <rect width="512" height="512" rx="100" fill="#070b14" stroke="url(#hCyberGreen)" stroke-width="4"/>
    <!-- S Monogram -->
    <path d="M 320 170 C 320 135, 290 120, 256 120 C 210 120, 180 145, 180 185 C 180 230, 225 245, 256 256 C 290 268, 335 285, 335 330 C 335 375, 298 400, 256 400 C 215 400, 185 380, 182 345" 
          fill="none" stroke="url(#hCyberGreen)" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" filter="url(#hGlow)"/>
    <line x1="165" y1="355" x2="347" y2="165" stroke="#ffffff" stroke-width="6" stroke-linecap="round" filter="url(#hGlow)"/>
    <circle cx="165" cy="355" r="9" fill="#10b981"/>
    <circle cx="256" cy="256" r="10" fill="#38bdf8"/>
    <circle cx="347" cy="165" r="9" fill="#34d399"/>
  </g>

  <!-- Typography: STOCK SYSTEM -->
  <text x="270" y="115" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="58" letter-spacing="-1" fill="#ffffff">
    STOCK <tspan fill="url(#hCyberGreen)">SYSTEM</tspan>
  </text>

  <!-- Subtitle: QUANTITATIVE TRADING TERMINAL -->
  <text x="272" y="160" font-family="'JetBrains Mono', monospace" font-weight="600" font-size="16" letter-spacing="4" fill="#94a3b8">
    QUANTITATIVE TERMINAL &amp; INTELLIGENCE
  </text>

  <!-- Live Status Badge -->
  <g transform="translate(735, 75)">
    <rect width="115" height="32" rx="16" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1"/>
    <circle cx="20" cy="16" r="4.5" fill="#10b981"/>
    <text x="34" y="21" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" fill="#34d399">PRO v1.0</text>
  </g>
</svg>"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Created Horizontal SVG logo at {output_path}")

def create_png_logo_pillow(output_path, size=1024):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Rounded Squircle with Dark Gradient
    for i in range(size):
        ratio = i / size
        # Radial gradient approximation
        pass

    # Draw rounded rect background
    draw.rounded_rectangle([20, 20, size - 20, size - 20], radius=int(size * 0.22), fill=(10, 16, 28, 255), outline=(16, 185, 129, 120), width=4)

    # Inner subtle grid
    for x in range(160, size - 100, 140):
        draw.line([(x, 120), (x, size - 120)], fill=(30, 41, 59, 100), width=2)
    for y in range(160, size - 100, 140):
        draw.line([(120, y), (size - 120, y)], fill=(30, 41, 59, 100), width=2)

    # 2. Candlesticks
    # Red candle
    draw.line([(260, 520), (260, 760)], fill=(244, 63, 94, 255), width=5)
    draw.rounded_rectangle([240, 580, 280, 700], radius=8, fill=(244, 63, 94, 255))

    # Green candle 1
    draw.line([(360, 400), (360, 700)], fill=(16, 185, 129, 255), width=5)
    draw.rounded_rectangle([340, 460, 380, 630], radius=8, fill=(16, 185, 129, 255))

    # Green candle 2 (high)
    draw.line([(660, 260), (660, 600)], fill=(16, 185, 129, 255), width=5)
    draw.rounded_rectangle([640, 320, 680, 510], radius=8, fill=(16, 185, 129, 255))

    # Cyan candle peak
    draw.line([(770, 180), (770, 480)], fill=(6, 182, 212, 255), width=5)
    draw.rounded_rectangle([750, 230, 790, 390], radius=8, fill=(6, 182, 212, 255))

    # 3. Main 'S' Curve with high-tech look
    # Draw central S glyph
    center_x, center_y = size // 2, size // 2
    r = 180
    
    # Draw sweeping arc segments
    draw.arc([center_x - r, center_y - 2*r + 60, center_x + r, center_y + 60], start=180, end=360, fill=(16, 185, 129, 255), width=36)
    draw.arc([center_x - r, center_y - 60, center_x + r, center_y + 2*r - 60], start=0, end=180, fill=(6, 182, 212, 255), width=36)

    # Diagonal Quant Breakthrough line
    draw.line([(330, 710), (690, 330)], fill=(255, 255, 255, 255), width=10)
    
    # Quantum Nodes
    draw.ellipse([315, 695, 345, 725], fill=(16, 185, 129, 255), outline=(255, 255, 255, 255), width=4)
    draw.ellipse([500, 510, 524, 534], fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=4)
    draw.ellipse([675, 315, 705, 345], fill=(52, 211, 153, 255), outline=(255, 255, 255, 255), width=4)

    # Save PNG
    img.save(output_path, "PNG")
    print(f"Created PNG logo at {output_path}")

if __name__ == "__main__":
    public_dir = os.path.join(os.getcwd(), "frontend", "public")
    os.makedirs(public_dir, exist_ok=True)
    
    svg_path = os.path.join(public_dir, "logo.svg")
    h_svg_path = os.path.join(public_dir, "logo-horizontal.svg")
    png_path = os.path.join(public_dir, "logo.png")
    favicon_path = os.path.join(public_dir, "favicon.svg")

    create_svg_logo(svg_path)
    create_svg_logo(favicon_path)
    create_horizontal_svg_logo(h_svg_path)
    create_png_logo_pillow(png_path)
    print("All Logo Assets Generated Successfully!")
