<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Marco OS

Aplicacao frontend em React/Vite para operacao pessoal, observabilidade e fluxos de agentes do Marco OS.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and preencha apenas as variaveis necessarias para os bridges locais
3. Run the app:
   `npm run dev`

## Quality Checks

- `npm run build`
- `npm run typecheck`

## Notes

- Este frontend nao deve receber segredos injetados no bundle em tempo de build.
- Integracoes sensiveis devem passar por backend/bridge/CLI dedicado.
