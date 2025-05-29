# Mooveat 🍔

Mooveat é um aplicativo web desenvolvido com Next.js e TypeScript que conecta usuários ao McDonald’s mais próximo, facilitando o pedido de refeições de forma prática e intuitiva. Para garantir a melhor experiência e precisão na localização, utilizamos o **algoritmo de Dijkstra** para calcular a rota mais curta até o estabelecimento.

---

## 🎯 Funcionalidades

* 🏪 Listagem das hamburguerias
* 🚀 Cálculo de rota otimizada: utiliza o **algoritmo de Dijkstra** para encontrar o McDonald’s mais próximo considerando distâncias reais e penalidades de tráfego
* 📱 Interface responsiva e mobile-first

---

## ⚙️ Implementação do Algoritmo de Busca

Para determinar o estabelecimento mais próximo, o sistema monta um grafo de nós (localizações dos restaurantes e usuário) e arestas (distâncias). Em seguida:

1. Coletamos coordenadas de cada McDonald’s disponível via Google Maps API.
2. Construímos um grafo onde cada aresta recebe o peso da distância real entre dois pontos.
3. Aplicamos **Dijkstra** para obter o caminho de menor custo do usuário até cada restaurante.
4. Exibimos ao usuário a melhor rota e o tempo estimado de deslocamento.

Essa abordagem garante precisão e eficiência na definição da melhor opção de pedido.

---

## 🛠️ Tecnologias Utilizadas

* **Next.js** – Framework React para aplicações web modernas
* **React** – Biblioteca de UI
* **TypeScript** – Superset JavaScript para tipagem estática
* **Tailwind CSS** – Estilização modular e utilitária
* **Node.js** – Ambiente de execução
* **Google Maps API** – Para obtenção de coordenadas e validação de rotas
* **Algoritmo de Dijkstra** – Implementação customizada em TypeScript no módulo `lib/graph.ts`
* **Vercel** – Plataforma de deploy

---

## 🚀 Como Executar Localmente

1. **Clone o repositório**

   ```bash
   git clone https://github.com/henriquepmartins/mooveat.git
   cd mooveat
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env.local` na raiz do projeto e adicione:

   ```env
   PLACES_API_KEY=api-key-google-maps
   ```

4. **Inicie o modo de desenvolvimento**

   ```bash
   bun dev
   # ou
   npm dev
   ```

   Acesse `http://localhost:3000` no navegador.

5. **Build e Produção**

   ```bash
   bun run build
   bun start
   # ou
   npm build
   npm start
   ```

---

## 📁 Estrutura de Diretórios

```
├── app/               # Rotas e servidores (Next.js App Router)
├── components/        # Componentes reutilizáveis
├── hooks/             # Custom React Hooks
├── lib/               # Helpers e bibliotecas internas (inclui graph.ts com Dijkstra)
├── public/            # Arquivos estáticos (imagens, ícones)
├── styles/            # Estilos globais e variáveis CSS
├── types/             # Definições de tipos TypeScript
├── .env.example       # Exemplo de variáveis de ambiente
├── next.config.ts     # Configuração do Next.js
├── package.json       # Dependências e scripts
└── README.md          # Documentação do projeto
```

---

## 🤝 Contribuição

1. Fork este repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona feature'`)
4. Push para a branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT. © 2025 Mooveat Team
