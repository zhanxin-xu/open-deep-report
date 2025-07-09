import { config } from 'dotenv';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

// Load environment variables
config();

// === Core Types ===
export type LLMProvider = 'openai' | 'gemini';

// === Configuration Interfaces ===
export interface LLMConfig {
    provider: LLMProvider;
    model: string;
    temperature: number;
    maxTokens?: number;
    maxRetries?: number;
    timeout?: number;
}

export interface ProviderCredentials {
    apiKey?: string;
    baseURL?: string;
    credentialsPath?: string;
}

// === Default Configurations ===
const DEFAULT_MODELS: Record<LLMProvider | 'vertexai', string> = {
    openai: 'qwen-max-latest',
    gemini: 'gemini-2.0-flash',
    vertexai: 'gemini-2.0-flash-001',
} as const;

const DEFAULT_LLM_CONFIG: Omit<LLMConfig, 'provider' | 'model'> = {
    temperature: 0.1,
    maxTokens: 8000,
    maxRetries: 2,
    timeout: 30000,
} as const;

// === Environment Variable Helpers ===
const getEnvString = (key: string, defaultValue = ''): string => process.env[key] || defaultValue;

const getEnvNumber = (key: string, defaultValue = 0): number => {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
};

const getEnvBoolean = (key: string, defaultValue = false): boolean => {
    const value = process.env[key];
    return value ? value.toLowerCase() === 'true' : defaultValue;
};

// === Provider Configurations ===
export const openaiConfig: ProviderCredentials = {
    apiKey: getEnvString('OPENAI_API_KEY'),
    baseURL: getEnvString('OPENAI_BASE_URL'),
} as const;

export const geminiConfig: ProviderCredentials = {
    apiKey: getEnvString('GEMINI_API_KEY'),
    credentialsPath: getEnvString('GOOGLE_APPLICATION_CREDENTIALS'),
} as const;

export const taskLLMConfig: Record<string, { model?: string; temperature: number }> = {
    webGenerator: {
        model: getEnvString('WEB_GENERATOR_MODEL_NAME', 'gemini-2.5-flash-preview-05-20'),
        temperature: 0.1,
    },
    planner: {
        temperature: 0.2,
    },
    reporter: {
        temperature: 0.8,
    },
};

export const serviceConfig = {
    search: {
        tavily: getEnvString('TAVILY_API_KEY'),
        brave: getEnvString('BRAVE_API_KEY'),
        serper: getEnvString('SERPER_API_KEY'),
    },
    data: {
        coinglass: getEnvString('COINGLASS_API_KEY'),
        coingecko: getEnvString('COINGECKO_API_KEY'),
        tokenomist: getEnvString('TOKENOMIST_API_KEY'),
        artemis: getEnvString('ARTEMIS_API_KEY'),
        tokenTerminal: getEnvString('TOKEN_TERMINAL_API_KEY'),
    },
    osp: {
        analystBaseUrl: getEnvString('OSP_ANALYST_BASE_URL', 'https://osp-knowledge-server-prod.ospprotocol.xyz'),
        ipfsUrl: getEnvString('OSP_IPFS_URL'),
        ipfsApiKey: getEnvString('OSP_IPFS_API_KEY'),
        ipfsViewUrl: getEnvString('OSP_IPFS_VIEW_URL'),
    },
    mcp: {
        serverHost: getEnvString('MCP_SERVER_HOST'),
        get openapiSpec() {
            return (
                getEnvString('MCP_SERVER_OPENAPI_SPEC') || (this.serverHost ? `${this.serverHost}/openapi.json` : '')
            );
        },
    },
    redis: {
        host: getEnvString('REDIS_HOST'),
        port: getEnvNumber('REDIS_PORT', 6379),
        password: getEnvString('REDIS_PASSWORD'),
        db: getEnvNumber('REDIS_DB', 0),
    },
    thirdweb: {
        secretKey: getEnvString('THIRDWEB_SECRET_KEY'),
    },
    app: {
        stepSleep: getEnvNumber('STEP_SLEEP', 100),
        webGeneratorModel: getEnvString('WEB_GENERATOR_MODEL_NAME'),
        checkpointerUrl: getEnvString('CHECKPOINTER_URL'),
    },
} as const;

// === Provider Status ===
export const isProviderEnabled = (provider: LLMProvider): boolean => {
    switch (provider) {
        case 'openai':
            return !!openaiConfig.apiKey;
        case 'gemini':
            return !!geminiConfig.apiKey || !!geminiConfig.credentialsPath;
        default:
            return false;
    }
};

export const getAvailableProviders = (): LLMProvider[] => {
    const providers: LLMProvider[] = ['gemini', 'openai'];
    return providers.filter((provider) => isProviderEnabled(provider));
};

export const getDefaultProvider = (): LLMProvider => {
    // Priority: gemini -> openai -> vertexai
    if (isProviderEnabled('gemini')) return 'gemini';
    if (isProviderEnabled('openai')) return 'openai';
    throw new Error('No LLM provider is enabled. Please configure at least one provider.');
};

// === Configuration Functions ===

export const getLLMConfig = (options: Partial<LLMConfig> = {}): LLMConfig => {
    const provider = options.provider || getDefaultProvider();
    const model = options.model || DEFAULT_MODELS[provider];
    const temperature = options.temperature || DEFAULT_LLM_CONFIG.temperature;
    return {
        ...DEFAULT_LLM_CONFIG,
        model,
        provider,
        temperature,
    };
};

// === Legacy Exports (for backward compatibility) ===
export const OPENAI_API_KEY = openaiConfig.apiKey;
export const OPENAI_BASE_URL = openaiConfig.baseURL;
export const GEMINI_API_KEY = geminiConfig.apiKey;

export const TAVILY_API_KEY = serviceConfig.search.tavily;
export const BRAVE_API_KEY = serviceConfig.search.brave;
export const SERPER_API_KEY = serviceConfig.search.serper;

export const COINGLASS_API_KEY = serviceConfig.data.coinglass;
export const COINGECKO_API_KEY = serviceConfig.data.coingecko;
export const TOKENOMIST_API_KEY = serviceConfig.data.tokenomist;
export const ARTEMIS_API_KEY = serviceConfig.data.artemis;
export const TOKEN_TERMINAL_API_KEY = serviceConfig.data.tokenTerminal;

export const OSP_ANALYST_BASE_URL = serviceConfig.osp.analystBaseUrl;
export const OSP_IPFS_URL = serviceConfig.osp.ipfsUrl;
export const OSP_IPFS_API_KEY = serviceConfig.osp.ipfsApiKey;
export const OSP_IPFS_VIEW_URL = serviceConfig.osp.ipfsViewUrl;

export const MCP_SERVER_HOST = serviceConfig.mcp.serverHost;
export const MCP_SERVER_OPENAPI_SPEC = serviceConfig.mcp.openapiSpec;

export const REDIS_HOST = serviceConfig.redis.host;
export const REDIS_PORT = serviceConfig.redis.port;
export const REDIS_PASSWORD = serviceConfig.redis.password;
export const REDIS_DB = serviceConfig.redis.db;

export const THIRDWEB_SECRET_KEY = serviceConfig.thirdweb.secretKey;
export const CHECKPOINTER_URL = serviceConfig.app.checkpointerUrl;

// === Proxy Setup ===
const proxyUrl = getEnvString('https_proxy');
if (proxyUrl) {
    try {
        const dispatcher = new ProxyAgent({ uri: proxyUrl });
        setGlobalDispatcher(dispatcher);
    } catch (error) {
        console.error('Failed to set proxy:', error);
    }
}
