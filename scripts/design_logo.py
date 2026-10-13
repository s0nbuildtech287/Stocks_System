import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_svg_logo(output_path):
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Dark Onyx Canvas Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#181A20"/>
      <stop offset="60%" stop-color="#12161C"/>
      <stop offset="100%" stop-color="#0B0E11"/>
    </radialGradient>

    <!-- Binance Metallic Gold Gradient -->
    <linearGradient id="binanceGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD535"/>
      <stop offset="30%" stop-color="#F0B90B"/>
      <stop offset="70%" stop-color="#E5A905"/>
      <stop offset="100%" stop-color="#C99400"/>
    </linearGradient>

    <!-- Bright Gold Highlight -->
    <linearGradient id="goldGlow" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D99E00"/>
      <stop offset="50%" stop-color="#F0B90B"/>
      <stop offset="100%" stop-color="#FFF066"/>
    </linearGradient>

    <!-- Dark Metal Border Gradient -->
    <linearGradient id="metalBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0B90B" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#474D57" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#F0B90B" stop-opacity="0.6"/>
    </linearGradient>

    <!-- Soft Glow Filter -->
    <filter id="goldFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Canvas (Rounded Luxury Squircle) -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  
  <!-- Outer Gold & Carbon Border -->
  <rect x="18" y="18" width="476" height="476" rx="96" fill="none" stroke="url(#metalBorder)" stroke-width="2.5"/>
  <rect x="30" y="30" width="452" height="452" rx="84" fill="none" stroke="#2B313A" stroke-width="1.5" stroke-dasharray="6 6"/>

  <!-- Ambient Golden Center Core Glow -->
  <circle cx="256" cy="256" r="130" fill="#F0B90B" opacity="0.12" filter="url(#heavyGlow)"/>

  <!-- Geometric Diamond Lattice / Quantum Grid -->
  <g opacity="0.18" stroke="#F0B90B" stroke-width="1">
    <line x1="256" y1="80" x2="432" y2="256" stroke-dasharray="4 4"/>
    <line x1="432" y1="256" x2="256" y2="432" stroke-dasharray="4 4"/>
    <line x1="256" y1="432" x2="80" y2="256" stroke-dasharray="4 4"/>
    <line x1="80" y1="256" x2="256" y2="80" stroke-dasharray="4 4"/>
    <circle cx="256" cy="256" r="160" fill="none" stroke="#F0B90B" stroke-width="0.8" stroke-dasharray="3 6"/>
  </g>

  <!-- Financial Chart Elements in Subtle Gold & Amber -->
  <g opacity="0.35">
    <rect x="135" y="270" width="16" height="60" rx="3" fill="#848E9C"/>
    <line x1="143" y1="250" x2="143" y2="350" stroke="#848E9C" stroke-width="2"/>

    <rect x="175" y="220" width="16" height="85" rx="3" fill="#F0B90B"/>
    <line x1="183" y1="200" x2="183" y2="330" stroke="#F0B90B" stroke-width="2"/>

    <rect x="325" y="170" width="16" height="95" rx="3" fill="#F0B90B"/>
    <line x1="333" y1="140" x2="333" y2="290" stroke="#F0B90B" stroke-width="2"/>

    <rect x="365" y="130" width="16" height="75" rx="3" fill="#FCD535"/>
    <line x1="373" y1="105" x2="373" y2="230" stroke="#FCD535" stroke-width="2"/>
  </g>

  <!-- Ascending Golden Growth Arc -->
  <path d="M 110 360 C 180 370, 200 270, 260 250 C 320 230, 360 140, 425 115" 
        fill="none" 
        stroke="url(#goldGlow)" 
        stroke-width="5.5" 
        stroke-linecap="round" 
        filter="url(#goldFilter)"/>
  
  <polygon points="432,112 406,108 418,132" fill="#FFF066" filter="url(#goldFilter)"/>

  <!-- CENTRAL ICONIC EMBLEM: Interlocking Gold Diamond & 'S S' Monogram -->
  <g transform="translate(0, 0)">
    <!-- Outer Rotated Diamond Rhombus Wings -->
    <polygon points="256,96 396,236 366,236 256,126 146,236 116,236" fill="url(#binanceGold)" opacity="0.95" filter="url(#goldFilter)"/>
    <polygon points="256,416 396,276 366,276 256,386 146,276 116,276" fill="url(#binanceGold)" opacity="0.85" filter="url(#goldFilter)"/>

    <!-- Upper 'S' Ribbon -->
    <path d="M 330 185 
             C 330 145, 295 130, 256 130 
             C 210 130, 185 155, 185 190 
             C 185 235, 240 245, 275 255 
             C 310 265, 335 280, 335 320 
             C 335 365, 298 385, 256 385 
             C 210 385, 180 360, 180 325" 
          fill="none" 
          stroke="url(#binanceGold)" 
          stroke-width="26" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          filter="url(#goldFilter)"/>

    <!-- Inner Core Golden Diamond -->
    <polygon points="256,215 297,256 256,297 215,256" fill="#FFF066" opacity="0.95" filter="url(#goldFilter)"/>
    <polygon points="256,230 282,256 256,282 230,256" fill="#0B0E11"/>
    <polygon points="256,242 270,256 256,270 242,256" fill="#F0B90B"/>
  </g>

  <!-- High-Precision Metric Badges on Base -->
  <g transform="translate(196, 436)">
    <rect x="-4" y="-2" width="128" height="26" rx="13" fill="#181A20" stroke="#F0B90B" stroke-width="1.5"/>
    <text x="60" y="15" fill="#FCD535" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="3">STOCK SYSTEM</text>
  </g>
</svg>"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Created Gold & Black SVG logo at: {output_path}")

def create_horizontal_svg_logo(output_path):
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 140" width="100%" height="100%">
  <defs>
    <linearGradient id="binanceGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD535"/>
      <stop offset="40%" stop-color="#F0B90B"/>
      <stop offset="100%" stop-color="#C99400"/>
    </linearGradient>
    <filter id="hGlow">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feComposite in="SourceGraphic" in2="b" operator="over"/>
    </filter>
  </defs>

  <!-- Left Icon Emblem (Gold & Black Diamond SS) -->
  <g transform="translate(10, 10)">
    <rect width="120" height="120" rx="30" fill="#181A20" stroke="#F0B90B" stroke-width="2"/>
    
    <!-- Top & Bottom Diamond Caps -->
    <polygon points="60,20 95,55 85,55 60,30 35,55 25,55" fill="url(#binanceGold)" filter="url(#hGlow)"/>
    <polygon points="60,100 95,65 85,65 60,90 35,65 25,65" fill="url(#binanceGold)" filter="url(#hGlow)"/>

    <!-- Central S Curve -->
    <path d="M 78 42 C 78 32, 70 28, 60 28 C 48 28, 42 34, 42 42 C 42 53, 55 56, 64 59 C 74 62, 80 66, 80 77 C 80 88, 70 93, 60 93 C 48 93, 40 86, 40 78" 
          fill="none" 
          stroke="url(#binanceGold)" 
          stroke-width="7" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          filter="url(#hGlow)"/>

    <polygon points="60,52 68,60 60,68 52,60" fill="#FCD535"/>
  </g>

  <!-- Typography: STOCK SYSTEM in Gold & White -->
  <g transform="translate(150, 48)">
    <text x="0" y="32" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" letter-spacing="1">
      STOCK <tspan fill="url(#binanceGold)">SYSTEM</tspan>
    </text>
    <text x="2" y="56" fill="#848E9C" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="4">
      VIETNAM QUANTITATIVE PLATFORM
    </text>
  </g>
</svg>"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Created Gold & Black Horizontal SVG logo at: {output_path}")

def create_favicon_svg(output_path):
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="goldFav" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD535"/>
      <stop offset="60%" stop-color="#F0B90B"/>
      <stop offset="100%" stop-color="#C99400"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="#0B0E11"/>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="#F0B90B" stroke-width="2"/>
  
  <polygon points="32,8 52,28 46,28 32,14 18,28 12,28" fill="url(#goldFav)"/>
  <polygon points="32,56 52,36 46,36 32,50 18,36 12,36" fill="url(#goldFav)"/>

  <path d="M 42 22 C 42 16, 37 14, 32 14 C 26 14, 22 17, 22 22 C 22 28, 30 30, 34 32 C 39 34, 43 37, 43 43 C 43 49, 38 52, 32 52 C 25 52, 21 47, 21 42" 
        fill="none" 
        stroke="url(#goldFav)" 
        stroke-width="5" 
        stroke-linecap="round"/>
  <polygon points="32,28 36,32 32,36 28,32" fill="#FCD535"/>
</svg>"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Created Gold & Black Favicon SVG at: {output_path}")

def generate_raster_assets():
    width, height = 512, 512
    img = Image.new("RGBA", (width, height), (11, 14, 17, 255))
    draw = ImageDraw.Draw(img)

    # Draw rounded rectangle background
    draw.rounded_rectangle([16, 16, 496, 496], radius=90, fill=(24, 26, 32, 255), outline=(240, 185, 11, 200), width=4)
    draw.rounded_rectangle([28, 28, 484, 484], radius=78, fill=None, outline=(43, 49, 58, 255), width=2)

    # Core Diamond & SS Emblem in Gold
    gold_main = (240, 185, 11, 255)
    gold_light = (252, 213, 53, 255)

    # Top & Bottom Diamond Wings
    draw.polygon([(256, 100), (380, 224), (350, 224), (256, 130), (162, 224), (132, 224)], fill=gold_main)
    draw.polygon([(256, 412), (380, 288), (350, 288), (256, 382), (162, 288), (132, 288)], fill=gold_main)

    # Center Monogram Lines
    draw.ellipse([200, 200, 312, 312], outline=gold_light, width=6)
    draw.polygon([(256, 220), (292, 256), (256, 292), (220, 256)], fill=gold_light)
    draw.polygon([(256, 235), (277, 256), (256, 277), (235, 256)], fill=(11, 14, 17, 255))

    # Save PNG and ICO
    frontend_pub = "frontend/public"
    os.makedirs(frontend_pub, exist_ok=True)
    
    png_path = os.path.join(frontend_pub, "logo.png")
    img.save(png_path, "PNG")

    # Generate multi-size ICO
    ico_path = os.path.join(frontend_pub, "favicon.ico")
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    img.save(ico_path, format="ICO", sizes=icon_sizes)
    print(f"Saved raster PNG and ICO to {frontend_pub}")

if __name__ == "__main__":
    frontend_pub = "frontend/public"
    os.makedirs(frontend_pub, exist_ok=True)

    create_svg_logo(os.path.join(frontend_pub, "logo.svg"))
    create_horizontal_svg_logo(os.path.join(frontend_pub, "logo-horizontal.svg"))
    create_favicon_svg(os.path.join(frontend_pub, "favicon.svg"))
    generate_raster_assets()
    print("All Gold & Black luxury brand assets created successfully!")
