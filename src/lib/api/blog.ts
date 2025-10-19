import type { BlogPost, PaginatedBlogPosts } from "@/types/blog"
import { getPaginationData } from "@/lib/utils/pagination"

// Mock blog data for development
const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "beneficios-proteina-whey",
    title: "Los Beneficios de la Proteína Whey para el Desarrollo Muscular",
    excerpt:
      "Descubre cómo la proteína whey puede ayudarte a alcanzar tus objetivos de fitness más rápido y de manera más efectiva.",
    content: `
# Los Beneficios de la Proteína Whey para el Desarrollo Muscular

La proteína whey es uno de los suplementos más populares y estudiados en el mundo del fitness. En este artículo, exploraremos sus beneficios respaldados por la ciencia.

## ¿Qué es la Proteína Whey?

La proteína whey, o proteína de suero de leche, es una proteína completa de alta calidad que se obtiene durante el proceso de fabricación del queso. Contiene todos los aminoácidos esenciales que tu cuerpo necesita.

## Beneficios Principales

### 1. Construcción Muscular
La proteína whey es rica en leucina, un aminoácido clave para la síntesis de proteínas musculares. Estudios demuestran que consumir 20-25g de proteína whey después del entrenamiento maximiza el crecimiento muscular.

### 2. Recuperación Rápida
Su rápida absorción la hace ideal para el período post-entrenamiento, ayudando a reparar el tejido muscular dañado durante el ejercicio intenso.

### 3. Control del Apetito
La proteína whey aumenta la saciedad, lo que puede ayudarte a controlar tu ingesta calórica y mantener un peso saludable.

### 4. Fortalecimiento del Sistema Inmune
Contiene inmunoglobulinas y lactoferrina que apoyan la función inmunológica.

## ¿Cuándo Tomarla?

- **Post-entrenamiento**: 30 minutos después de tu sesión
- **Entre comidas**: Como snack proteico
- **Desayuno**: Para aumentar tu ingesta proteica matutina

## Conclusión

La proteína whey es un suplemento versátil y efectivo para cualquier persona que busque mejorar su composición corporal y rendimiento deportivo.
    `,
    coverImage: "/protein-shake-fitness.jpg",
    category: "Nutrición",
    author: {
      name: "Dr. Carlos Martínez",
      avatar: "/male-doctor.png",
    },
    publishedAt: new Date("2025-01-15"),
    tags: ["Proteína", "Nutrición", "Músculo"],
    readTime: 5,
  },
  {
    id: "2",
    slug: "guia-suplementos-principiantes",
    title: "Guía Completa de Suplementos para Principiantes",
    excerpt: "Todo lo que necesitas saber antes de comenzar con suplementos deportivos. Una guía paso a paso.",
    content: `
# Guía Completa de Suplementos para Principiantes

Si estás comenzando en el mundo del fitness, la cantidad de suplementos disponibles puede ser abrumadora. Esta guía te ayudará a entender qué necesitas realmente.

## Antes de Empezar

**Importante**: Los suplementos son exactamente eso - suplementos. No reemplazan una dieta balanceada y un entrenamiento consistente.

## Los 5 Suplementos Esenciales

### 1. Proteína en Polvo
- **Para qué**: Alcanzar tus requerimientos diarios de proteína
- **Cuándo**: Post-entrenamiento o entre comidas
- **Dosis**: 20-30g por porción

### 2. Creatina Monohidrato
- **Para qué**: Aumentar fuerza y masa muscular
- **Cuándo**: Cualquier momento del día
- **Dosis**: 5g diarios

### 3. Omega-3
- **Para qué**: Salud cardiovascular y reducción de inflamación
- **Cuándo**: Con las comidas
- **Dosis**: 1-3g de EPA+DHA diarios

### 4. Vitamina D
- **Para qué**: Salud ósea y función inmune
- **Cuándo**: Con comida que contenga grasa
- **Dosis**: 2000-4000 IU diarios

### 5. Multivitamínico
- **Para qué**: Cubrir posibles deficiencias nutricionales
- **Cuándo**: Con el desayuno
- **Dosis**: Según indicaciones del producto

## Suplementos Opcionales

- **Pre-entreno**: Para energía y enfoque
- **BCAAs**: Si entrenas en ayunas
- **Glutamina**: Para recuperación intestinal

## Errores Comunes a Evitar

1. Comprar demasiados suplementos al inicio
2. No ser consistente con la suplementación
3. Esperar resultados mágicos
4. No consultar con un profesional

## Conclusión

Comienza con lo básico: proteína y creatina. A medida que avances, puedes agregar otros suplementos según tus necesidades específicas.
    `,
    coverImage: "/supplements-bottles-fitness.jpg",
    category: "Guías",
    author: {
      name: "Ana López",
      avatar: "/woman-fitness-trainer.png",
    },
    publishedAt: new Date("2025-01-10"),
    tags: ["Guía", "Principiantes", "Suplementos"],
    readTime: 8,
  },
  {
    id: "3",
    slug: "creatina-mitos-realidades",
    title: "Creatina: Mitos y Realidades",
    excerpt:
      "Desmitificamos las creencias más comunes sobre la creatina monohidrato basándonos en evidencia científica.",
    content: `
# Creatina: Mitos y Realidades

La creatina es uno de los suplementos más estudiados y efectivos, pero también está rodeada de mitos. Separemos los hechos de la ficción.

## ¿Qué es la Creatina?

La creatina es un compuesto natural que se encuentra en las células musculares. Ayuda a producir energía durante el ejercicio de alta intensidad.

## Mitos Comunes

### Mito 1: "La creatina es un esteroide"
**FALSO**: La creatina es un compuesto natural presente en alimentos como la carne y el pescado. No tiene nada que ver con esteroides anabólicos.

### Mito 2: "La creatina daña los riñones"
**FALSO**: Múltiples estudios han demostrado que la creatina es segura para personas sanas. No causa daño renal en dosis recomendadas.

### Mito 3: "Necesitas hacer fase de carga"
**PARCIALMENTE FALSO**: Aunque la fase de carga (20g/día por 5-7 días) funciona, no es necesaria. Puedes tomar 5g diarios desde el inicio.

### Mito 4: "La creatina causa retención de agua"
**VERDADERO PERO...**: Sí causa retención de agua, pero es intracelular (dentro del músculo), lo que contribuye al crecimiento muscular.

### Mito 5: "Solo funciona para hombres"
**FALSO**: La creatina es igualmente efectiva en mujeres para mejorar fuerza y composición corporal.

## Beneficios Reales

1. **Aumento de fuerza**: 5-15% en promedio
2. **Ganancia de masa muscular**: 1-2kg en las primeras semanas
3. **Mejora del rendimiento**: En ejercicios de alta intensidad
4. **Neuroprotección**: Beneficios cognitivos potenciales

## Cómo Tomarla Correctamente

- **Dosis**: 5g diarios
- **Momento**: Cualquier hora (la consistencia es más importante)
- **Con qué**: Agua, jugo o tu batido de proteína
- **Tipo**: Creatina monohidrato (la más estudiada)

## Efectos Secundarios Reales

- Leve malestar estomacal (raro)
- Aumento de peso por retención de agua
- Calambres (muy raro, usualmente por deshidratación)

## Conclusión

La creatina es uno de los suplementos más seguros y efectivos disponibles. No creas en los mitos y aprovecha sus beneficios respaldados por la ciencia.
    `,
    coverImage: "/creatine-powder.png",
    category: "Suplementación",
    author: {
      name: "Dr. Carlos Martínez",
      avatar: "/male-doctor.png",
    },
    publishedAt: new Date("2025-01-05"),
    tags: ["Creatina", "Ciencia", "Mitos"],
    readTime: 6,
  },
  {
    id: "4",
    slug: "pre-entreno-necesario",
    title: "¿Realmente Necesitas un Pre-Entreno?",
    excerpt: "Analizamos si los suplementos pre-entreno son necesarios y cómo elegir el mejor para ti.",
    content: `
# ¿Realmente Necesitas un Pre-Entreno?

Los pre-entrenos son populares, pero ¿son realmente necesarios? Descubre si deberías incluirlos en tu rutina.

## ¿Qué es un Pre-Entreno?

Un suplemento pre-entreno es una mezcla de ingredientes diseñada para aumentar energía, enfoque y rendimiento durante el entrenamiento.

## Ingredientes Clave

### Cafeína
- Aumenta energía y enfoque
- Dosis efectiva: 150-300mg
- Equivalente a 1-2 tazas de café

### Beta-Alanina
- Reduce la fatiga muscular
- Puede causar hormigueo (normal)
- Dosis: 2-5g

### Citrulina Malato
- Mejora el flujo sanguíneo
- Aumenta el "pump" muscular
- Dosis: 6-8g

### Creatina
- Aumenta fuerza y potencia
- Dosis: 5g

## ¿Cuándo Tomarlo?

- 20-30 minutos antes del entrenamiento
- Con el estómago vacío o ligero
- No después de las 6pm si eres sensible a la cafeína

## ¿Lo Necesitas?

**SÍ, si:**
- Entrenas muy temprano en la mañana
- Tienes poca energía antes del gym
- Buscas mejorar tu rendimiento en ejercicios intensos

**NO, si:**
- Eres sensible a la cafeína
- Entrenas en la noche
- Tienes buena energía naturalmente
- Tienes problemas cardíacos (consulta a tu médico)

## Alternativas Naturales

- Café negro (150-200mg cafeína)
- Plátano + mantequilla de maní
- Té verde
- Agua con limón

## Conclusión

Los pre-entrenos pueden ser útiles, pero no son esenciales. Evalúa tus necesidades y objetivos antes de invertir en uno.
    `,
    coverImage: "/pre-workout-supplement-energy.jpg",
    category: "Suplementación",
    author: {
      name: "Ana López",
      avatar: "/woman-fitness-trainer.png",
    },
    publishedAt: new Date("2025-01-01"),
    tags: ["Pre-Entreno", "Energía", "Rendimiento"],
    readTime: 7,
  },
  {
    id: "5",
    slug: "dieta-para-ganar-masa-muscular",
    title: "Plan de Dieta para Ganar Masa Muscular",
    excerpt: "Un plan nutricional completo para maximizar tus ganancias musculares de forma saludable.",
    content: `
# Plan de Dieta para Ganar Masa Muscular

Ganar masa muscular requiere más que solo entrenar duro. La nutrición es fundamental. Aquí está tu guía completa.

## Principios Básicos

### 1. Superávit Calórico
Necesitas consumir más calorías de las que quemas. Un superávit de 300-500 calorías diarias es ideal para ganar músculo minimizando la grasa.

### 2. Proteína Suficiente
- **Objetivo**: 1.6-2.2g por kg de peso corporal
- **Ejemplo**: Si pesas 70kg, necesitas 112-154g de proteína diaria

### 3. Carbohidratos para Energía
- **Objetivo**: 4-6g por kg de peso corporal
- Los carbohidratos alimentan tus entrenamientos intensos

### 4. Grasas Saludables
- **Objetivo**: 0.8-1g por kg de peso corporal
- Importantes para la producción hormonal

## Ejemplo de Plan Diario (70kg)

### Desayuno (7:00 AM)
- 3 huevos enteros
- 2 rebanadas de pan integral
- 1 plátano
- 1 vaso de leche

**Macros**: 35g proteína, 60g carbohidratos, 20g grasa

### Media Mañana (10:00 AM)
- Batido de proteína
- 1 puñado de almendras
- 1 manzana

**Macros**: 30g proteína, 40g carbohidratos, 15g grasa

### Almuerzo (1:00 PM)
- 200g pechuga de pollo
- 1 taza de arroz integral
- Ensalada mixta con aceite de oliva
- 1 aguacate

**Macros**: 50g proteína, 70g carbohidratos, 25g grasa

### Pre-Entreno (4:00 PM)
- 1 plátano
- 2 cucharadas de mantequilla de maní
- Café negro

**Macros**: 5g proteína, 35g carbohidratos, 16g grasa

### Post-Entreno (6:30 PM)
- Batido de proteína
- 1 taza de avena
- 1 cucharada de miel

**Macros**: 35g proteína, 60g carbohidratos, 8g grasa

### Cena (8:00 PM)
- 200g salmón
- 200g papa dulce
- Brócoli al vapor

**Macros**: 45g proteína, 50g carbohidratos, 20g grasa

### Antes de Dormir (10:00 PM)
- Yogurt griego
- 1 cucharada de semillas de chía

**Macros**: 20g proteína, 15g carbohidratos, 8g grasa

## Total Diario
- **Proteína**: 220g
- **Carbohidratos**: 330g
- **Grasas**: 112g
- **Calorías**: ~3,100

## Consejos Adicionales

1. **Hidratación**: Bebe al menos 3 litros de agua diaria
2. **Consistencia**: La clave es ser constante día tras día
3. **Ajustes**: Evalúa tu progreso cada 2 semanas
4. **Calidad**: Prioriza alimentos enteros sobre procesados
5. **Descanso**: Duerme 7-9 horas para recuperación óptima

## Suplementos Recomendados

- Proteína en polvo (para conveniencia)
- Creatina monohidrato (5g diarios)
- Omega-3 (2-3g diarios)
- Multivitamínico

## Conclusión

Ganar masa muscular es un proceso que requiere paciencia, consistencia y una nutrición adecuada. Sigue este plan, ajústalo a tus necesidades y verás resultados.
    `,
    coverImage: "/healthy-meal-prep-muscle-building.jpg",
    category: "Nutrición",
    author: {
      name: "Dr. Carlos Martínez",
      avatar: "/male-doctor.png",
    },
    publishedAt: new Date("2024-12-28"),
    tags: ["Dieta", "Nutrición", "Masa Muscular"],
    readTime: 10,
  },
  {
    id: "6",
    slug: "aminoacidos-bcaa-necesarios",
    title: "BCAAs: ¿Son Realmente Necesarios?",
    excerpt: "Descubre si los aminoácidos de cadena ramificada son esenciales para tu entrenamiento o solo marketing.",
    content: `
# BCAAs: ¿Son Realmente Necesarios?

Los BCAAs (aminoácidos de cadena ramificada) son uno de los suplementos más vendidos, pero ¿realmente los necesitas?

## ¿Qué son los BCAAs?

Los BCAAs son tres aminoácidos esenciales:
- **Leucina**: El más importante para la síntesis proteica
- **Isoleucina**: Ayuda en la recuperación muscular
- **Valina**: Apoya el metabolismo energético

## Beneficios Propuestos

### 1. Reducción del Catabolismo
Los BCAAs pueden ayudar a prevenir la degradación muscular durante el ejercicio prolongado.

### 2. Mejora de la Recuperación
Pueden reducir el dolor muscular post-entrenamiento (DOMS).

### 3. Aumento de la Síntesis Proteica
La leucina activa mTOR, una vía clave para el crecimiento muscular.

## La Verdad Científica

**Aquí está el problema**: Si ya consumes suficiente proteína (1.6-2.2g/kg), probablemente NO necesitas BCAAs.

### ¿Por qué?

La proteína completa (whey, carne, huevos) ya contiene todos los BCAAs que necesitas, además de los otros 6 aminoácidos esenciales.

## ¿Cuándo SÍ son Útiles?

1. **Entrenamiento en ayunas**: Si entrenas sin comer, los BCAAs pueden prevenir el catabolismo
2. **Dieta vegana**: Si no consumes proteína animal, pueden ser beneficiosos
3. **Deportes de resistencia**: Para eventos de larga duración
4. **Déficit calórico severo**: Durante una dieta muy restrictiva

## ¿Cuándo NO los Necesitas?

1. Ya consumes suficiente proteína diaria
2. Tomas proteína whey (que es 25% BCAAs)
3. Comes antes y después de entrenar
4. Tu presupuesto es limitado (hay mejores opciones)

## Alternativas Mejores

En lugar de BCAAs, considera:
- **Proteína whey**: Contiene BCAAs + otros aminoácidos
- **EAAs**: Todos los aminoácidos esenciales
- **Comida real**: Pollo, huevos, pescado

## Dosis Recomendada (si decides tomarlos)

- **Cantidad**: 5-10g
- **Ratio**: 2:1:1 (leucina:isoleucina:valina)
- **Momento**: Durante o después del entrenamiento

## Conclusión

Los BCAAs no son malos, pero tampoco son necesarios para la mayoría de las personas. Si tu dieta es adecuada en proteína, tu dinero está mejor invertido en otros suplementos como creatina o proteína whey.
    `,
    coverImage: "/bcaa-amino-acids-supplement.jpg",
    category: "Suplementación",
    author: {
      name: "Ana López",
      avatar: "/woman-fitness-trainer.png",
    },
    publishedAt: new Date("2024-12-20"),
    tags: ["BCAAs", "Aminoácidos", "Suplementos"],
    readTime: 6,
  },
]

export async function listBlogPosts(page = 1, pageSize = 9): Promise<PaginatedBlogPosts> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const sortedPosts = [...MOCK_POSTS].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  const paginationData = getPaginationData(sortedPosts, page, pageSize)

  return {
    posts: paginationData.items,
    total: paginationData.total,
    page: paginationData.page,
    pageSize: paginationData.pageSize,
    totalPages: paginationData.totalPages,
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  return MOCK_POSTS.find((p) => p.slug === slug) || null
}
