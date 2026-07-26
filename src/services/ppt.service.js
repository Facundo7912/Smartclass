import PptxGenJs from 'pptxgenjs';

/**
 * Genera una presentación PowerPoint profesional
 * @param {Object} pptData - Datos de la presentación
 * @param {string} pptData.title - Título de la presentación
 * @param {Array} pptData.slides - Array de diapositivas
 * @param {string} pptData.slides[].title - Título de la diapositiva
 * @param {Array} pptData.slides[].content - Array de strings con el contenido
 * @returns {Promise<Buffer>} Buffer con el archivo PowerPoint
 */
export const generatePPT = async (pptData) => {
  try {
    const { title, slides } = pptData;

    if (!title || !slides || !Array.isArray(slides)) {
      throw new Error('pptData debe contener "title" y "slides" (array)');
    }

    // Crear nueva presentación
    const prs = new PptxGenJs();

    // Configuración de tamaño y márgenes
    prs.defineLayout({ name: 'LAYOUT1', width: 10, height: 7.5 });
    prs.defineLayout({ name: 'LAYOUT_TITULO', width: 10, height: 7.5 });

    // Definir estilos globales
    const colorPrimario = '1F2937'; // Azul oscuro/gris
    const colorSecundario = '3B82F6'; // Azul
    const colorTexto = '1F2937';
    const colorFondo = 'FFFFFF';

    // ========== DIAPOSITIVA DE TÍTULO ==========
    const slideTitulo = prs.addSlide();
    slideTitulo.background = { color: colorPrimario };

    // Título principal
    slideTitulo.addText(title, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1.5,
      fontSize: 54,
      bold: true,
      color: colorFondo,
      align: 'center',
      fontFace: 'Arial',
    });

    // Subtítulo
    slideTitulo.addText('Generado con SmartClass IA', {
      x: 0.5,
      y: 4.2,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: colorSecundario,
      align: 'center',
      fontFace: 'Arial',
    });

    // ========== DIAPOSITIVAS DE CONTENIDO ==========
    slides.forEach((slide, index) => {
      const slideContent = prs.addSlide();
      slideContent.background = { color: colorFondo };

      // Línea superior decorativa
      slideContent.addShape(prs.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.15,
        fill: { color: colorSecundario },
        line: { type: 'none' },
      });

      // Número de diapositiva en la esquina superior derecha
      slideContent.addText(`${index + 1}`, {
        x: 9.2,
        y: 0.3,
        w: 0.6,
        h: 0.4,
        fontSize: 12,
        color: colorSecundario,
        align: 'right',
        fontFace: 'Arial',
      });

      // Título de la diapositiva
      slideContent.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 8.5,
        h: 0.8,
        fontSize: 40,
        bold: true,
        color: colorPrimario,
        fontFace: 'Arial',
      });

      // Línea separadora bajo el título
      slideContent.addShape(prs.ShapeType.rect, {
        x: 0.5,
        y: 1.4,
        w: 9,
        h: 0.05,
        fill: { color: colorSecundario },
        line: { type: 'none' },
      });

      // Contenido con viñetas
      if (slide.content && Array.isArray(slide.content)) {
        let posY = 1.8;

        slide.content.forEach((item) => {
          // Viñeta
          slideContent.addText('•', {
            x: 0.7,
            y: posY,
            w: 0.3,
            h: 0.4,
            fontSize: 16,
            color: colorSecundario,
            fontFace: 'Arial',
          });

          // Texto del contenido
          slideContent.addText(item, {
            x: 1.2,
            y: posY,
            w: 8.2,
            h: 0.8,
            fontSize: 14,
            color: colorTexto,
            fontFace: 'Arial',
            wrap: true,
          });

          posY += 0.9;
        });
      }

      // Pie de página
      slideContent.addText('SmartClass - Educación Asistida por IA', {
        x: 0.5,
        y: 7,
        w: 9,
        h: 0.4,
        fontSize: 10,
        color: '#999999',
        align: 'center',
        fontFace: 'Arial',
      });
    });

    // Generar y devolver como Buffer

    // ✅ DESPUÉS (funciona en cualquier plataforma)
    const base64 = await pptx.write({ outputType: 'base64' });
    const buffer = Buffer.from(base64, 'base64');
    return buffer;
  } catch (error) {
    console.error('❌ [PPT Service] Error generando PowerPoint:', error);
    throw error;
  }
};

export default generatePPT;
