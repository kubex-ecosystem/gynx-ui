import { unifiedAIService } from '@/services/unifiedAIService';
import { useProvidersStore } from '@/store/useProvidersStore';

export interface CodeGenerationSpec {
  stack: string;
  goal: string;
  constraints: string[];
  extras: string;
}

export interface ImagePromptSpec {
  subject: string;
  mood: string;
  style: string;
  details: string;
}

const resolveProvider = (): string => useProvidersStore.getState().globalDefault;

export const creativeService = {
  async summarize(
    input: string,
    tone: string,
    maxWords: number,
    apiKey?: string,
  ): Promise<string> {
    const provider = resolveProvider();
    const prompt = [
      'Voce e um especialista em sintese executiva.',
      'Responda em portugues do Brasil.',
      `Tom desejado: ${tone}.`,
      `Limite maximo: ${maxWords} palavras.`,
      'Entregue um resumo final pronto para compartilhar.',
      'Use markdown leve quando ajudar na leitura.',
      '',
      'Conteudo base:',
      input,
    ].join('\n');

    const result = await unifiedAIService.generateDirectPrompt(
      prompt,
      provider,
      undefined,
      1200,
      apiKey,
    );

    return result.response.trim();
  },

  async generateCode(spec: CodeGenerationSpec, apiKey?: string): Promise<string> {
    const provider = resolveProvider();
    const prompt = [
      'Voce e um engenheiro de software senior.',
      'Responda em portugues do Brasil.',
      'Entregue codigo e explicacoes praticas, sem filler.',
      `Stack alvo: ${spec.stack}.`,
      `Objetivo: ${spec.goal}.`,
      `Constraints: ${spec.constraints.length > 0 ? spec.constraints.join(', ') : 'nenhuma adicional'}.`,
      `Observacoes extras: ${spec.extras || 'nenhuma'}.`,
      '',
      'Estruture a resposta com:',
      '1. Visao geral curta.',
      '2. Codigo principal.',
      '3. Proximos passos ou testes recomendados.',
    ].join('\n');

    const result = await unifiedAIService.generateDirectPrompt(
      prompt,
      provider,
      undefined,
      2400,
      apiKey,
    );

    return result.response.trim();
  },

  async craftImagePrompt(spec: ImagePromptSpec, apiKey?: string): Promise<string> {
    const provider = resolveProvider();
    const prompt = [
      'Voce e um diretor criativo especializado em prompts para modelos de imagem.',
      'Responda em portugues do Brasil.',
      'Entregue apenas o prompt final e, em seguida, uma linha curta de observacoes tecnicas opcionais.',
      `Tema principal: ${spec.subject}.`,
      `Clima: ${spec.mood}.`,
      `Estilo: ${spec.style}.`,
      `Detalhes adicionais: ${spec.details || 'nenhum detalhe adicional'}.`,
      '',
      'Monte um prompt rico em composicao, iluminacao, materiais, enquadramento e atmosfera.',
    ].join('\n');

    const result = await unifiedAIService.generateDirectPrompt(
      prompt,
      provider,
      undefined,
      900,
      apiKey,
    );

    return result.response.trim();
  },
};
