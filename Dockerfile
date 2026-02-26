FROM node:20-alpine AS builder

WORKDIR /app

ENV VITE_SUPABASE_URL=https://eqyvawvybtpwttdhgxgk.supabase.co
ENV VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeXZhd3Z5YnRwd3R0ZGhneGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDU4MTMsImV4cCI6MjA4NjkyMTgxM30.rArm35bixtmVPwVQ4sfztdAiJv7JeEACHOLQctlpDXc
ENV VITE_SUPABASE_PROJECT_ID=eqyvawvybtpwttdhgxgk

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
