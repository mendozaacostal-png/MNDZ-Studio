/**
 * ================================================================================
 * PROYECTO: Portal Web Comercial y Sistema de Compra en Línea "MNDZ Studio"
 * SUBMÓDULO: Diseño e Implementación de Páginas Web (DGETI - CBTis 225)
 * ETAPA 3: Lógica Cliente con Flujo Progresivo de Compra (JavaScript ES6)
 * AUTORES: Mendoza Acosta Luciano & Moncada Mendoza Nestor Matias
 * DESCRIPCIÓN: Controla la navegación de categorías, el carrito fijo superior,
 *              y la aparición secuencial de Formulario de Pago y Estado del Pago.
 * ================================================================================
 */

document.addEventListener('DOMContentLoaded', function () {

    /* ============================================================================
       1. REFERENCIAS A ELEMENTOS DEL DOM Y ESTADO GLOBAL
       ============================================================================ */
    const vistas = document.querySelectorAll('#contenedor-vistas > section');
    const enlacesVistas = document.querySelectorAll('a[href^="#vista-"]');
    const btnMenuMovil = document.getElementById('btn-menu-movil');
    const navPrincipal = document.querySelector('#encabezado-principal nav');
    const btnCarritoFijo = document.getElementById('btn-carrito-fijo');
    const botonesAgregar = document.querySelectorAll('.tarjeta-producto button');
    const tbodyCarrito = document.getElementById('lista-carrito');
    const celdaTotalCarrito = document.getElementById('total-carrito');
    const btnVaciarCarrito = document.getElementById('btn-vaciar-carrito');
    const formularioPago = document.getElementById('formulario-pago');
    const bloquePagoExitoso = document.getElementById('mensaje-pago-exitoso');
    const bloquePagoRechazado = document.getElementById('mensaje-pago-rechazado');

    // Arreglo que almacena los productos agregados al carrito
    let carrito = [];


    /* ============================================================================
       2. NAVEGACIÓN ENTRE VISTAS Y FLUJO PROGRESIVO DE COMPRA
       ============================================================================ */

    /**
     * Muestra únicamente la vista solicitada y oculta las demás.
     * @param {string} idVista - Identificador de la sección (ej. "vista-ropa").
     */
    function mostrarVista(idVista) {
        vistas.forEach(function (seccion) {
            if (seccion.id === idVista) {
                seccion.classList.remove('oculto');
            } else {
                seccion.classList.add('oculto');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Controla todos los enlaces internos entre vistas
    enlacesVistas.forEach(function (enlace) {
        enlace.addEventListener('click', function (evento) {
            evento.preventDefault();
            const destinoId = enlace.getAttribute('href').substring(1);

            // Impide avanzar al Formulario de Pago si el carrito aún está vacío
            if (destinoId === 'vista-pago' && carrito.length === 0) {
                mostrarNotificacionFlotante('Agrega al menos un producto al carrito antes de continuar al pago.');
                return;
            }

            mostrarVista(destinoId);

            // Cierra el menú móvil tras elegir una categoría
            if (navPrincipal && navPrincipal.classList.contains('menu-abierto')) {
                navPrincipal.classList.remove('menu-abierto');
                if (btnMenuMovil) {
                    btnMenuMovil.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });


    /* ============================================================================
       3. MENÚ HAMBURGUESA INTERACTIVO PARA VERSIÓN MÓVIL (<768px)
       ============================================================================ */
    if (btnMenuMovil && navPrincipal) {
        btnMenuMovil.addEventListener('click', function () {
            const estaAbierto = navPrincipal.classList.toggle('menu-abierto');
            btnMenuMovil.setAttribute('aria-expanded', String(estaAbierto));
        });
    }


    /* ============================================================================
       4. GESTIÓN DINÁMICA DEL CARRITO DE COMPRAS
       ============================================================================ */

    /**
     * Muestra una notificación flotante temporal en la esquina inferior derecha.
     * @param {string} mensaje - Texto informativo para el cliente.
     */
    function mostrarNotificacionFlotante(mensaje) {
        const alertaPrevia = document.querySelector('.alerta-info');
        if (alertaPrevia) {
            alertaPrevia.remove();
        }

        const aviso = document.createElement('p');
        aviso.className = 'alerta-visual alerta-info';
        aviso.setAttribute('role', 'status');
        aviso.textContent = mensaje;
        document.body.appendChild(aviso);

        setTimeout(function () {
            aviso.remove();
        }, 2600);
    }

    /**
     * Formatea un valor numérico a pesos mexicanos (MXN).
     * @param {number} cantidad - Monto numérico.
     * @returns {string} Cadena con formato "$399.00 MXN".
     */
    function formatearMoneda(cantidad) {
        return '$' + cantidad.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' MXN';
    }

    /**
     * Actualiza la tabla del carrito, recalcula el total y actualiza el botón fijo.
     */
    function renderizarCarrito() {
        if (!tbodyCarrito || !celdaTotalCarrito) {
            return;
        }

        tbodyCarrito.innerHTML = '';
        let totalGeneral = 0;
        let cantidadTotalArticulos = 0;

        if (carrito.length === 0) {
            const filaVacia = document.createElement('tr');
            filaVacia.innerHTML =
                '<td colspan="6" style="text-align: center; padding: 1.5rem;">' +
                'Tu carrito de compras está vacío. Explora el catálogo para agregar productos.' +
                '</td>';
            tbodyCarrito.appendChild(filaVacia);
        } else {
            carrito.forEach(function (item, indice) {
                const subtotal = item.precio * item.cantidad;
                totalGeneral += subtotal;
                cantidadTotalArticulos += item.cantidad;

                const fila = document.createElement('tr');
                fila.innerHTML =
                    '<td><strong>' + item.nombre + '</strong></td>' +
                    '<td>' + item.categoria + '</td>' +
                    '<td>' + formatearMoneda(item.precio) + '</td>' +
                    '<td>' + item.cantidad + '</td>' +
                    '<td><strong>' + formatearMoneda(subtotal) + '</strong></td>' +
                    '<td><button type="button" class="btn-eliminar-item" data-indice="' + indice + '">Eliminar</button></td>';
                tbodyCarrito.appendChild(fila);
            });
        }

        celdaTotalCarrito.innerHTML = '<strong>' + formatearMoneda(totalGeneral) + '</strong>';

        // Actualiza el contador en el botón fijo del encabezado
        if (btnCarritoFijo) {
            btnCarritoFijo.textContent = 'Carrito de Compras (' + cantidadTotalArticulos + ')';
        }

        // Activa los botones "Eliminar" de cada fila
        const botonesEliminar = document.querySelectorAll('.btn-eliminar-item');
        botonesEliminar.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const indice = Number(btn.getAttribute('data-indice'));
                carrito.splice(indice, 1);
                renderizarCarrito();
            });
        });
    }

    /**
     * Agrega un producto al carrito o incrementa su cantidad si ya estaba agregado.
     */
    function agregarProductoAlCarrito(nombre, categoria, precio) {
        const productoExistente = carrito.find(function (item) {
            return item.nombre === nombre;
        });

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                nombre: nombre,
                categoria: categoria,
                precio: precio,
                cantidad: 1
            });
        }

        renderizarCarrito();
        mostrarNotificacionFlotante('Agregado al carrito: ' + nombre);
    }

    // Escucha los clics en todos los botones "Agregar al Carrito"
    botonesAgregar.forEach(function (boton) {
        boton.addEventListener('click', function () {
            const tarjeta = boton.closest('.tarjeta-producto');
            const nombreBase = boton.getAttribute('data-producto');
            const precio = Number(boton.getAttribute('data-precio'));
            const categoriaRaw = tarjeta ? tarjeta.getAttribute('data-categoria') : 'General';

            const mapaCategorias = {
                'ropa': 'Ropa y Calzado',
                'gorras-perfumes': 'Gorras y Perfumes',
                'joyeria': 'Joyería y Relojes'
            };
            const categoria = mapaCategorias[categoriaRaw] || 'Catálogo MNDZ';

            const selectorTalla = tarjeta ? tarjeta.querySelector('select') : null;
            const nombreFinal = selectorTalla
                ? nombreBase + ' (Talla: ' + selectorTalla.value + ')'
                : nombreBase;

            agregarProductoAlCarrito(nombreFinal, categoria, precio);
        });
    });

    // Evento para vaciar todo el carrito
    if (btnVaciarCarrito) {
        btnVaciarCarrito.addEventListener('click', function () {
            carrito = [];
            renderizarCarrito();
            mostrarNotificacionFlotante('El carrito ha sido vaciado.');
        });
    }


    /* ============================================================================
       5. VALIDACIÓN DEL FORMULARIO DE PAGO Y AVANCE A ESTADO DEL PAGO
       ============================================================================ */

    /**
     * Muestra una alerta visual de error dentro del formulario de pago.
     * @param {string} mensajeError - Descripción del campo a corregir.
     */
    function mostrarErrorFormulario(mensajeError) {
        const errorPrevio = document.getElementById('alerta-validacion-pago');
        if (errorPrevio) {
            errorPrevio.remove();
        }

        const contenedorAlerta = document.createElement('p');
        contenedorAlerta.id = 'alerta-validacion-pago';
        contenedorAlerta.className = 'alerta-visual alerta-error';
        contenedorAlerta.setAttribute('role', 'alert');
        contenedorAlerta.textContent = 'Error de validación: ' + mensajeError;

        if (formularioPago) {
            formularioPago.prepend(contenedorAlerta);
            contenedorAlerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Valida los datos de envío y tarjeta antes de confirmar el pago.
     * @returns {boolean} True si todo es válido; False si hay errores.
     */
    function validarFormularioPago() {
        if (carrito.length === 0) {
            mostrarErrorFormulario('Tu carrito está vacío. Agrega al menos un producto antes de pagar.');
            return false;
        }

        const nombre = document.getElementById('nombre-cliente').value.trim();
        const correo = document.getElementById('correo-cliente').value.trim();
        const telefono = document.getElementById('telefono-cliente').value.trim();
        const direccion = document.getElementById('direccion-envio').value.trim();
        const metodo = document.getElementById('metodo-pago').value;
        const tarjeta = document.getElementById('numero-tarjeta').value.trim();
        const expiracion = document.getElementById('fecha-expiracion').value.trim();
        const cvv = document.getElementById('cvv-tarjeta').value.trim();

        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTelefono = /^[0-9]{10}$/;
        const regexTarjeta = /^[0-9]{16}$/;
        const regexExpiracion = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
        const regexCvv = /^[0-9]{3,4}$/;

        if (nombre.length < 3) {
            mostrarErrorFormulario('Ingresa tu nombre completo (mínimo 3 caracteres).');
            return false;
        }
        if (!regexCorreo.test(correo)) {
            mostrarErrorFormulario('Ingresa un correo electrónico válido (ejemplo@dominio.com).');
            return false;
        }
        if (!regexTelefono.test(telefono)) {
            mostrarErrorFormulario('El teléfono debe contener exactamente 10 dígitos numéricos.');
            return false;
        }
        if (direccion.length < 10) {
            mostrarErrorFormulario('Ingresa una dirección de envío completa.');
            return false;
        }
        if (metodo === '') {
            mostrarErrorFormulario('Selecciona un método de pago válido.');
            return false;
        }
        if (!regexTarjeta.test(tarjeta)) {
            mostrarErrorFormulario('El número de tarjeta debe tener exactamente 16 dígitos sin espacios.');
            return false;
        }
        if (!regexExpiracion.test(expiracion)) {
            mostrarErrorFormulario('La fecha de expiración debe tener el formato MM/AA (ej. 08/28).');
            return false;
        }
        if (!regexCvv.test(cvv)) {
            mostrarErrorFormulario('El código CVV debe ser de 3 o 4 dígitos.');
            return false;
        }

        const errorPrevio = document.getElementById('alerta-validacion-pago');
        if (errorPrevio) {
            errorPrevio.remove();
        }

        return true;
    }

    // Escucha el envío del formulario para mostrar la Vista 6 (Estado del Pago)
    if (formularioPago) {
        formularioPago.setAttribute('novalidate', 'true');

        formularioPago.addEventListener('submit', function (evento) {
            evento.preventDefault();

            if (!validarFormularioPago()) {
                return;
            }

            const numeroTarjeta = document.getElementById('numero-tarjeta').value.trim();

            // Tarjeta terminada en "0000" simula "Pago No Procesado"
            if (numeroTarjeta.endsWith('0000')) {
                if (bloquePagoExitoso) bloquePagoExitoso.classList.add('oculto');
                if (bloquePagoRechazado) bloquePagoRechazado.classList.remove('oculto');
            } else {
                const folioAleatorio = Math.floor(1000 + Math.random() * 9000);
                if (bloquePagoExitoso) {
                    const etiquetaFolio = bloquePagoExitoso.querySelector('p:nth-of-type(2) strong');
                    if (etiquetaFolio) {
                        etiquetaFolio.textContent = '#MNDZ-2026-' + folioAleatorio;
                    }
                    bloquePagoExitoso.classList.remove('oculto');
                }
                if (bloquePagoRechazado) {
                    bloquePagoRechazado.classList.add('oculto');
                }

                carrito = [];
                renderizarCarrito();
                formularioPago.reset();
            }

            // Revela automáticamente la pantalla final de Estado de la Transacción
            mostrarVista('vista-estado-pago');
        });
    }


    /* ============================================================================
       6. INICIALIZACIÓN DE LA TIENDA
       ============================================================================ */
    renderizarCarrito();
    mostrarVista('vista-ropa');

});