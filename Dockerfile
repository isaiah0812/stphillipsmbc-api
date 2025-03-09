FROM node:20

ARG audience
ARG issuer
ARG port=8080
ARG cloudinary_url
ARG mongo_user
ARG mongo_password
ARG env=local

ENV AUTH0_AUDIENCE=${audience}
ENV AUTH0_ISSUER=${issuer}
ENV PORT=${port}
ENV CLOUDINARY_URL=${cloudinary_url}
ENV MONGO_USER=${mongo_user}
ENV MONGO_PASSWORD=${mongo_password}
ENV NODE_ENV=${env}

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm install -g typescript

RUN npm run build

CMD [ "npm", "start" ]