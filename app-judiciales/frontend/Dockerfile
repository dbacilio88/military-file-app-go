# Dockerfile para Frontend Next.js
# Imagen base con Node.js 18 Alpine (ligera y segura)
FROM node:18-alpine AS base

# Instalar dependencias necesarias para Alpine
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
FROM base AS deps
RUN npm ci --silent

# Construcción de la aplicación
FROM base AS builder
WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV BACKEND_URL http://backend:8082

# Construir la aplicación
RUN npm run build

# Imagen de producción
FROM node:18-alpine AS runner
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos de configuración
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar build output con permisos correctos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Variables de entorno
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]