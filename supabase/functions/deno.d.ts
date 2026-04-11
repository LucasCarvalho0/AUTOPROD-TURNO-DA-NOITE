// Declarações mínimas do runtime Deno para o editor não reclamar.
// Este arquivo é apenas para satisfazer o TypeScript/VSCode — a função
// roda de verdade no runtime Deno da Supabase, que já tem tudo isso nativo.

declare namespace Deno {
  /** Variáveis de ambiente disponíveis no runtime Deno. */
  const env: {
    get(key: string): string | undefined
  }

  /** Registra um handler HTTP para processar requests. */
  function serve(handler: (req: Request) => Response | Promise<Response>): void
}
