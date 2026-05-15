FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Get v86 build files AFTER COPY so they are not overwritten by local files
RUN npm pack v86 && \
    tar xzf v86-*.tgz && \
    mkdir -p public/v86 && \
    cp package/build/libv86.js public/v86/ && \
    cp package/build/v86.wasm public/v86/ && \
    cp package/build/v86-fallback.wasm public/v86/ && \
    rm -rf package v86-*.tgz

RUN wget -q -O public/v86/seabios.bin https://raw.githubusercontent.com/copy/v86/master/bios/seabios.bin && \
    wget -q -O public/v86/vgabios.bin https://raw.githubusercontent.com/copy/v86/master/bios/vgabios.bin

RUN wget -q -O public/v86/freedos722.img https://copy.sh/v86/images/freedos722.img || \
    wget -q -O public/v86/freedos722.img https://github.com/copy/v86/raw/master/images/freedos722.img

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
