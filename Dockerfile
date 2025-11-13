FROM php:8.3-apache

RUN apt-get update && apt-get install -y libzip-dev unzip python3 \
    && docker-php-ext-install mysqli pdo_mysql zip \
    && docker-php-ext-enable mysqli \
    && rm -rf /var/lib/apt/lists/*

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

WORKDIR /var/www/html
COPY . /var/www/html

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

WORKDIR /var/www/html/gn
RUN python3 builder.py
RUN apt-get purge -y python3

WORKDIR /var/www/html
RUN a2enmod rewrite

EXPOSE 80
CMD ["apache2-foreground"]
