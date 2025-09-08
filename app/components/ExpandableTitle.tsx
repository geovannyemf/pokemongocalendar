import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"

interface ExpandableTitleProps {
  title: string
}

export function ExpandableTitle({ title }: ExpandableTitleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [truncatedText, setTruncatedText] = useState('');
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateTruncation = () => {
      if (!titleRef.current) return;

      const container = titleRef.current;
      const containerWidth = container.offsetWidth;
      
      // Crear elemento temporal para mediciones
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.style.width = containerWidth + 'px';
      tempElement.style.fontSize = getComputedStyle(container).fontSize;
      tempElement.style.fontFamily = getComputedStyle(container).fontFamily;
      tempElement.style.lineHeight = getComputedStyle(container).lineHeight;
      tempElement.style.textAlign = 'justify';
      
      document.body.appendChild(tempElement);

      // Verificar si el texto completo excede 3 líneas
      tempElement.textContent = title;
      const lineHeight = parseFloat(getComputedStyle(tempElement).lineHeight);
      const maxHeight = lineHeight * 3;

      if (tempElement.offsetHeight > maxHeight) {
        setIsOverflowing(true);
        
        // Encontrar cuánto texto cabe en 3 líneas incluyendo "... Ver más"
        const words = title.split(' ');
        let bestFit = '';
        
        for (let i = words.length; i > 0; i--) {
          const testText = words.slice(0, i).join(' ') + '... Ver más';
          tempElement.innerHTML = testText;
          
          if (tempElement.offsetHeight <= maxHeight) {
            bestFit = words.slice(0, i).join(' ');
            break;
          }
        }
        
        setTruncatedText(bestFit);
      } else {
        setIsOverflowing(false);
        setTruncatedText('');
      }

      document.body.removeChild(tempElement);
    };

    const timeoutId = setTimeout(calculateTruncation, 10);
    
    window.addEventListener('resize', calculateTruncation);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateTruncation);
    };
  }, [title]);

  return (
    <div className="space-y-2">
      <CardTitle 
        ref={titleRef}
        className="text-lg text-justify leading-snug"
      >
        {!isExpanded && isOverflowing ? (
          <span>
            {truncatedText}
            <span className="text-gray-500">...</span>
            <span 
              className="text-gray-500 hover:text-blue-700 cursor-pointer font-normal ml-1 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
            >
              Ver más
            </span>
          </span>
        ) : (
          <span>
            {title}
            {isExpanded && isOverflowing && (
              <span 
                className="text-gray-500 hover:text-blue-700 cursor-pointer font-normal ml-2 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                Ver menos
              </span>
            )}
          </span>
        )}
      </CardTitle>
    </div>
  );
}
