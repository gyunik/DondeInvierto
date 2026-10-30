from PIL import Image, ImageDraw

def crear_favicon():
    # Creamos una imagen de 512x512 con fondo transparente (RGBA)
    size = (512, 512)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 1. Dibujamos las barras con bordes redondeados usando el color principal
    # El color simulado es el tono magenta/violeta del logo (#E040FB)
    color_barras = (224, 64, 251, 255)
    
    # Barra 1
    draw.rounded_rectangle([70, 270, 105, 400], radius=8, fill=color_barras)
    # Barra 2
    draw.rounded_rectangle([125, 200, 160, 400], radius=8, fill=color_barras)
    # Barra 3
    draw.rounded_rectangle([180, 130, 215, 400], radius=8, fill=color_barras)
    
    # 2. Dibujamos el signo de pregunta integrado
    # Barra 4 del signo
    draw.rounded_rectangle([235, 170, 270, 400], radius=8, fill=color_barras)
    # Curva superior del signo de pregunta (un arco grueso hecho con círculos)
    draw.ellipse([235, 155, 385, 305], outline=color_barras, width=35)
    # Borramos el excedente del arco para que quede forma de '?'
    draw.rectangle([235, 250, 280, 310], fill=(0, 0, 0, 0))
    # Punto del signo de pregunta
    draw.ellipse([295, 370, 335, 410], fill=color_barras)
    
    # 3. Dibujamos la flecha ascendente (Color Rojo #FF1744)
    color_flecha = (255, 23, 68, 255)
    
    # Línea curva de tendencia simplificada para que no falle el renderizado
    draw.arc([30, 110, 260, 390], start=90, end=180, fill=color_flecha, width=24)
    
    # Cabeza de la flecha (Triángulo)
    puntos_flecha = [(215, 125), (260, 110), (250, 155)]
    draw.polygon(puntos_flecha, fill=color_flecha)
    
    # Guardamos el archivo final como PNG tradicional
    img.save("favicon.png", "PNG")
    print("¡Archivo 'favicon.png' creado con éxito y sin errores!")

if __name__ == "__main__":
    crear_favicon()
