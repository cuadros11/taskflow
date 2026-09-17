<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSocket } from '../composables/useSocket';
import { useRequestStore } from '../store/requestStore';

const route = useRoute();
const router = useRouter();
const { conectado } = useSocket();
const store = useRequestStore();

const menuAbierto = ref(false);

const enlaces = [
  { nombre: 'dashboard', etiqueta: 'Dashboard', icono: '📊' },
  { nombre: 'solicitudes', etiqueta: 'Solicitudes', icono: '📋' },
  { nombre: 'nueva-solicitud', etiqueta: 'Nueva solicitud', icono: '➕' },
  { nombre: 'monitor', etiqueta: 'Monitor', icono: '🖥️' },
];

const titulo = computed(() => route.meta.titulo || 'TASKFLOW');
const totalSolicitudes = computed(() => store.monitor.contadores.total);

function irA(nombre) {
  menuAbierto.value = false;
  router.push({ name: nombre });
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <button class="boton-icono" aria-label="Abrir menú" @click="menuAbierto = !menuAbierto">
        ☰
      </button>
      <div class="app-titulo">
        <strong>TASKFLOW</strong>
        <span class="texto-suave">— {{ titulo }}</span>
      </div>
      <div class="app-estado">
        <span class="punto" :class="conectado ? 'punto-verde' : 'punto-rojo'"></span>
        <span class="texto-suave">{{ conectado ? 'En línea' : 'Sin conexión' }}</span>
      </div>
    </header>

    <div class="app-cuerpo">
      <aside class="app-menu" :class="{ 'menu-abierto': menuAbierto }">
        <nav>
          <button
            v-for="enlace in enlaces"
            :key="enlace.nombre"
            class="item-menu"
            :class="{ activo: route.name === enlace.nombre }"
            @click="irA(enlace.nombre)"
          >
            <span>{{ enlace.icono }}</span>
            <span>{{ enlace.etiqueta }}</span>
          </button>
        </nav>
        <div class="menu-resumen">
          <p class="texto-suave">Total solicitudes</p>
          <p class="menu-total">{{ totalSolicitudes }}</p>
        </div>
      </aside>

      <main class="app-contenido">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.2rem;
  background: var(--color-primario);
  color: #fff;
  box-shadow: var(--sombra-media);
}

.app-titulo {
  flex: 1;
  font-size: 1.05rem;
}

.app-titulo .texto-suave {
  color: #dbeafe;
}

.boton-icono {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.boton-icono:hover {
  background: rgba(255, 255, 255, 0.15);
}

.app-estado {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.app-estado .texto-suave {
  color: #dbeafe;
}

.punto {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.punto-verde {
  background: #34d399;
}

.punto-rojo {
  background: #f87171;
}

.app-cuerpo {
  display: flex;
  flex: 1;
}

.app-menu {
  width: 230px;
  background: var(--color-tarjeta);
  border-right: 1px solid var(--color-borde);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-menu {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  text-align: left;
  padding: 0.7rem 0.9rem;
  margin-bottom: 0.35rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-texto-suave);
  font-weight: 500;
}

.item-menu:hover {
  background: #f1f5f9;
}

.item-menu.activo {
  background: #eff6ff;
  color: var(--color-primario);
  font-weight: 600;
}

.menu-resumen {
  border-top: 1px solid var(--color-borde);
  padding-top: 1rem;
  margin-top: 1rem;
}

.menu-total {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primario);
  margin: 0;
}

.app-contenido {
  flex: 1;
  padding: 1.5rem;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .app-menu {
    position: fixed;
    z-index: 50;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: var(--sombra-media);
  }

  .app-menu.menu-abierto {
    transform: translateX(0);
  }

  .app-contenido {
    padding: 1rem;
  }
}
</style>