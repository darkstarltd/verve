
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Element, Style, ProjectType } from '../types';
import { toast } from 'react-hot-toast';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface Theme {
    variables?: { [key: string]: string };
    baseStyles: { [elementType: string]: Style };
}

// --- Common Schemas (remain the same)
const animationProperties = { type: Type.OBJECT, nullable: true, properties: { type: { type: Type.STRING }, duration: { type: Type.STRING }, delay: { type: Type.STRING } } };
const webProps = { src: { type: Type.STRING, nullable: true }, alt: { type: Type.STRING, nullable: true }, placeholder: { type: Type.STRING, nullable: true }, type: { type: Type.STRING, nullable: true } };
const nativeProps = { src: { type: Type.STRING, nullable: true }, placeholder: { type: Type.STRING, nullable: true } };
const flutterProps = { src: { type: Type.STRING, nullable: true }};

const webStyleProperties = { color: { type: Type.STRING, nullable: true }, backgroundColor: { type: Type.STRING, nullable: true }, padding: { type: Type.STRING, nullable: true }, margin: { type: Type.STRING, nullable: true }, borderRadius: { type: Type.STRING, nullable: true }, fontSize: { type: Type.STRING, nullable: true }, fontWeight: { type: Type.STRING, nullable: true }, textAlign: { type: Type.STRING, nullable:true }, width: { type: Type.STRING, nullable: true }, height: { type: Type.STRING, nullable: true }, minHeight: { type: Type.STRING, nullable: true }, display: { type: Type.STRING, nullable: true }, flexDirection: { type: Type.STRING, nullable: true }, justifyContent: { type: Type.STRING, nullable: true }, alignItems: { type: Type.STRING, nullable: true }, gap: { type: Type.STRING, nullable: true }, border: { type: Type.STRING, nullable: true }, borderBottom: { type: Type.STRING, nullable: true }, objectFit: { type: Type.STRING, nullable: true }, cursor: { type: Type.STRING, nullable: true }, boxShadow: { type: Type.STRING, nullable: true }, lineHeight: { type: Type.STRING, nullable: true }, transition: { type: Type.STRING, nullable: true }, marginBottom: { type: Type.STRING, nullable: true }};
const nativeStyleProperties = { color: { type: Type.STRING, nullable: true }, backgroundColor: { type: Type.STRING, nullable: true }, padding: { type: Type.NUMBER, nullable: true }, margin: { type: Type.NUMBER, nullable: true }, borderRadius: { type: Type.NUMBER, nullable: true }, fontSize: { type: Type.NUMBER, nullable: true }, fontWeight: { type: Type.STRING, nullable: true }, width: { type: Type.STRING, nullable: true }, height: { type: Type.NUMBER, nullable: true }, borderWidth: { type: Type.NUMBER, nullable: true }, borderColor: { type: Type.STRING, nullable: true }, flexDirection: { type: Type.STRING, nullable: true }, justifyContent: { type: Type.STRING, nullable: true }, alignItems: { type: Type.STRING, nullable: true }, gap: { type: Type.NUMBER, nullable: true }};
const flutterStyleProperties = {
  color: { type: Type.STRING, nullable: true, description: "Background color as a hex string e.g., '#FFFFFF'" },
  padding: { type: Type.OBJECT, nullable: true, properties: { all: { type: Type.NUMBER, nullable: true }, horizontal: { type: Type.NUMBER, nullable: true }, vertical: { type: Type.NUMBER, nullable: true }, top: { type: Type.NUMBER, nullable: true }, bottom: { type: Type.NUMBER, nullable: true }, left: { type: Type.NUMBER, nullable: true }, right: { type: Type.NUMBER, nullable: true } } },
  borderRadius: { type: Type.NUMBER, nullable: true },
  fontSize: { type: Type.NUMBER, nullable: true },
  fontWeight: { type: Type.STRING, nullable: true, description: "e.g., 'bold'" },
  width: { type: Type.NUMBER, nullable: true },
  height: { type: Type.NUMBER, nullable: true },
  mainAxisAlignment: { type: Type.STRING, nullable: true, description: "e.g., 'center', 'start', 'end', 'spaceBetween'" },
};


const makeElementSchema = (projectType: ProjectType, depth: number = 2): any => {
    let elementTypes: string[], styleProps: object, props: object;
    switch(projectType) {
        case 'native': elementTypes = ['View', 'Text', 'Image', 'Button', 'TextInput', 'ScrollView', 'Icon', 'ARView']; styleProps = nativeStyleProperties; props = nativeProps; break;
        case 'flutter': elementTypes = ['Container', 'Column', 'Row', 'Text', 'Image', 'ElevatedButton']; styleProps = flutterStyleProperties; props = flutterProps; break;
        case 'kotlin': elementTypes = ['Column', 'Row', 'Text', 'Button', 'Image']; styleProps = {}; props = {}; break; // Kotlin schema simplified as it's not the focus
        case 'web': default: elementTypes = ['container', 'flex', 'heading', 'text', 'button', 'image', 'icon', 'card', 'navbar', 'video', 'form', 'input', 'textarea', 'label']; styleProps = webStyleProperties; props = webProps; break;
    }
    const baseElement = {
        type: { type: Type.STRING, enum: elementTypes }, name: { type: Type.STRING },
        content: { type: Type.STRING, nullable: true },
        props: { type: Type.OBJECT, properties: props, nullable: true },
        styles: { type: Type.OBJECT, properties: { desktop: { type: Type.OBJECT, properties: styleProps } } },
        animation: projectType === 'web' ? animationProperties : { type: Type.NULL, nullable: true },
    };
    if (depth <= 0) return { type: Type.OBJECT, properties: { ...baseElement, children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {} }, nullable: true } } };
    const recursiveSchema: any = { ...baseElement };
    recursiveSchema.children = { type: Type.ARRAY, items: makeElementSchema(projectType, depth - 1), nullable: true };
    return { type: Type.OBJECT, properties: recursiveSchema };
};

const generateLayout = async (prompt: string, projectType: ProjectType, image?: string): Promise<Element[]> => {
    const platformName = projectType === 'native' ? 'React Native' : projectType.charAt(0).toUpperCase() + projectType.slice(1);
    const stylingInstruction = {
        'web': "Use CSS style values as strings.",
        'native': "Use React Native style values (numbers for sizes, strings for colors/enums).",
        'flutter': "Use Flutter style values (numbers for sizes, hex strings for colors, enums for alignment). For padding, use an object like {'all': 8}.",
        'kotlin': "For Kotlin/Compose, use appropriate style values (numbers for dp sizes, hex strings for colors)."
    };
    const websiteSchema = { type: Type.ARRAY, items: makeElementSchema(projectType, 3) };

    const fullPrompt = `Generate a component tree for a ${platformName} application based on the following prompt: "${prompt}". 
    The tree should be a hierarchical structure of components with properties for content, styling, and children. 
    Adhere to the following styling rules: ${stylingInstruction[projectType]}. 
    Ensure the generated JSON matches the provided schema precisely.
    Give every element a descriptive 'name' property.`;

    const contents = image 
        ? { parts: [{ text: fullPrompt }, { inlineData: { mimeType: 'image/png', data: image.split(',')[1] } }] }
        : fullPrompt;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: websiteSchema,
      },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse AI response:", e);
        console.log("Raw response:", response.text);
        throw new Error("AI returned an invalid layout structure. Please try again.");
    }
};


export async function generateWebsiteFromPrompt(prompt: string, projectType: ProjectType): Promise<Element[]> {
  const toastId = toast.loading(`Generating ${projectType} layout...`);
  try {
      const result = await generateLayout(prompt, projectType);
      toast.success('Layout generated!', { id: toastId });
      return result;
  } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Layout generation failed', { id: toastId });
      throw e;
  }
}

export async function generateLayoutFromImage(prompt: string, image: string, projectType: ProjectType): Promise<Element[]> {
    const toastId = toast.loading(`Generating ${projectType} layout from image...`);
    try {
        const result = await generateLayout(prompt, projectType, image);
        toast.success('Layout generated!', { id: toastId });
        return result;
    } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Layout generation failed', { id: toastId });
        throw e;
    }
}


export async function generateThemeFromPrompt(prompt: string, projectType: ProjectType): Promise<Theme> {
    const toastId = toast.loading(`Generating ${projectType} theme...`);
    
    const themeSchema = {
        type: Type.OBJECT,
        properties: {
            variables: {
                type: Type.OBJECT,
                properties: {
                    '--color-background': { type: Type.STRING },
                    '--color-surface': { type: Type.STRING },
                    '--color-primary': { type: Type.STRING },
                    '--color-primary-contrast': { type: Type.STRING },
                    '--color-text-primary': { type: Type.STRING },
                    '--color-text-secondary': { type: Type.STRING },
                }
            },
            baseStyles: {
                type: Type.OBJECT,
                properties: {
                    heading: { type: Type.OBJECT, properties: webStyleProperties },
                    text: { type: Type.OBJECT, properties: webStyleProperties },
                    button: { type: Type.OBJECT, properties: webStyleProperties },
                }
            }
        }
    };
    
    const fullPrompt = `Generate a theme for a ${projectType} app based on this description: "${prompt}". 
    Provide values for the CSS variables and base styles for common elements like headings, text, and buttons. 
    Ensure the JSON output matches the schema.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: themeSchema,
        },
      });

    try {
        toast.success('Theme generated!', { id: toastId });
        return JSON.parse(response.text.trim());
    } catch (e) {
        toast.error('Theme generation failed.', { id: toastId });
        throw new Error("AI returned an invalid theme structure.");
    }
}

export async function generateTextFromPrompt(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short piece of text based on the following prompt, and only return the text itself without any extra formatting or labels: "${prompt}"`,
    });
    return response.text.trim();
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
}

export async function generateIconFromPrompt(prompt: string): Promise<string> {
    const fullPrompt = `A simple, flat, single-color, SVG-style icon of ${prompt} on a transparent background.`;
    return generateImageFromPrompt(fullPrompt);
}

export async function generateStylesFromPrompt(prompt: string, elementType: string, projectType: ProjectType, mode: 'css' | 'tailwind' = 'css'): Promise<Style | string> {
    let responseSchema: any;
    let fullPrompt: string;
    
    if (mode === 'tailwind') {
        fullPrompt = `Generate a single string of Tailwind CSS utility classes for a '${elementType}' element, styled to look like: "${prompt}". Only return the string of class names.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        return response.text.trim().replace(/"/g, ''); // Clean up extra quotes
    } else {
        let styleProps: object;
        switch (projectType) {
            case 'native': styleProps = nativeStyleProperties; break;
            case 'flutter': styleProps = flutterStyleProperties; break;
            default: styleProps = webStyleProperties;
        }
        responseSchema = { type: Type.OBJECT, properties: styleProps };
        fullPrompt = `Generate a JSON object of styles for a '${elementType}' element based on the prompt: "${prompt}". Use appropriate keys and values for a ${projectType} application. The output must match the provided schema.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          },
        });
        
        return JSON.parse(response.text.trim());
    }
}