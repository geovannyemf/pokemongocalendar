// app/api/scrape-pokemon/route.ts
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request: Request) {
    const url = 'https://pokemongo.com/es/news';
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Escuchar mensajes de consola del navegador para debug
        page.on('console', msg => {
            for (let i = 0; i < msg.args().length; ++i)
                console.log(`[browser] ${msg.args()[i]}`);
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const scrapedData = await page.evaluate(() => {
            console.log('Scraping data from:', window.location.href);
            const results: { title: string; link?: string; date?: string; fullUrl?: string; imageUrl?: string }[] = [];

            // Función para limpiar y normalizar texto
            const cleanText = (text: string): string => {
                return text.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ');
            };

            // Función para extraer fechas del enlace
            const extractDateFromLink = (text: string): string | undefined => {
                // Buscar patrón tipo "29 jul 2025"
                const match = text.match(/(\d{1,2})\s+(jan|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\s+(\d{4})/i);
                console.log(`Extracting date from text: "${text}"`);
                console.log(`Match found: ${match ? match[0] : 'none'}`);
                if (match) {
                    const day = match[1].padStart(2, '0');
                    const monthStr = match[2].toLowerCase();
                    const year = match[3];

                    // Mapeo de meses en español a número
                    const months: { [key: string]: string } = {
                        ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
                        jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12'
                    };
                    const month = months[monthStr];
                    if (month) {
                        // Retornar en formato ISO
                        return `${year}-${month}-${day}T00:00:00Z`;
                    }
                }
                return undefined;
            };

            // Extrae la imagen asociada al enlace
            const extractImageFromLink = (link: HTMLAnchorElement): string => {
                // Buscar imagen dentro del enlace
                const imgInLink = link.querySelector('img');
                if (imgInLink && imgInLink.src) return imgInLink.src;
                // Buscar imagen en el elemento padre
                const parentElement = link.parentElement;
                if (parentElement) {
                    const imgInParent = parentElement.querySelector('img');
                    if (imgInParent && imgInParent.src) return imgInParent.src;
                }
                return '';
            };

            // SELECTORES CORRECTOS BASADOS EN LA ESTRUCTURA REAL DE POKÉMON GO
            console.log('Buscando enlaces de noticias y posts...');

            // Buscar todos los enlaces que contengan /news/ o /post/ en su href
            const newsLinks = document.querySelectorAll('a[href*="/news/"], a[href*="/post/"]');
            console.log(`Found ${newsLinks.length} news/post links`);

            newsLinks.forEach((linkElement, index) => {
                const link = linkElement as HTMLAnchorElement;
                const href = link.getAttribute('href');

                if (href && (href.includes('/news/') || href.includes('/post/'))) {
                    // Extraer el título del contenido del enlace
                    let title = '';

                    // El texto del enlace IS el título en la estructura actual
                    if (link.textContent && link.textContent.trim()) {
                        title = cleanText(link.textContent);
                    }

                    // Si el enlace no tiene texto, buscar en el elemento padre
                    if (!title || title.length < 5) {
                        const parentElement = link.parentElement;
                        if (parentElement && parentElement.textContent) {
                            title = cleanText(parentElement.textContent);
                        }
                    }

                    // Filtrar enlaces que no sean de noticias reales
                    const isValidNewsTitle = title &&
                        title.length > 10 &&
                        !title.match(/^\s*\[\s*\]\s*$/) &&
                        !title.includes('Política de') &&
                        !title.includes('Términos de') &&
                        !title.includes('Privacy');

                    if (isValidNewsTitle) {
                        console.log(`Found title: "${title}" with link: ${href}`);

                        // Construir URL completa
                        const fullUrl = href.startsWith('http') ?
                            href :
                            new URL(href, window.location.href).toString();

                        // Extraer fecha del enlace
                        const date = extractDateFromLink(title);
                        console.log(`Extracted date: ${date} for title: "${title}"`);
                        const imageUrl = extractImageFromLink(link);

                        results.push({
                            title: title,
                            link: href,
                            fullUrl: fullUrl,
                            date: date,
                            imageUrl: imageUrl
                        });
                    }
                }
            });

            // MÉTODO ALTERNATIVO: Buscar por estructura de contenedor
            console.log('Buscando estructuras alternativas...');

            // Intentar con selectores más genéricos si no encontramos suficientes resultados
            // if (results.length < 5) {
            //     const containerSelectors = [
            //         'article',
            //         'section',
            //         'div[class*="news"]',
            //         'div[class*="post"]',
            //         'li',
            //         '.content-item'
            //     ];

            //     containerSelectors.forEach(selector => {
            //         const containers = document.querySelectorAll(selector);

            //         containers.forEach(container => {
            //             const containerLink = container.querySelector('a[href*="/news/"], a[href*="/post/"]');

            //             if (containerLink) {
            //                 const href = containerLink.getAttribute('href');
            //                 let title = '';

            //                 // Buscar el título en el contenedor
            //                 const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
            //                 if (headingElements.length > 0) {
            //                     title = cleanText(headingElements[0].textContent || '');
            //                 } else if (containerLink.textContent) {
            //                     title = cleanText(containerLink.textContent);
            //                 } else {
            //                     title = cleanText(container.textContent || '').substring(0, 100);
            //                 }

            //                 if (href && title && title.length > 10) {
            //                     // Verificar que no sea duplicado
            //                     const isDuplicate = results.some(item => item.link === href);

            //                     if (!isDuplicate) {
            //                         const fullUrl = href.startsWith('http') ?
            //                             href :
            //                             new URL(href, window.location.href).toString();

            //                         const date = extractDateFromLink(title);
            //                         console.log(`Extracted date: ${date} for title: "${title}"`);
            //                         results.push({
            //                             title: title,
            //                             link: href,
            //                             fullUrl: fullUrl,
            //                             date: date
            //                         });
            //                     }
            //                 }
            //             }
            //         });
            //     });
            // }

            console.log(`Total news items found: ${results.length}`);
            return results;
        });

        return NextResponse.json({ events: scrapedData });

    } catch (error: any) {
        console.error('Error during scraping with Puppeteer:', error);

        return NextResponse.json(
            { success: false, message: 'An error occurred during scraping with Puppeteer.', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}