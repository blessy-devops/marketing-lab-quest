-- Create convites table
CREATE TABLE public.convites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'viewer',
    token UUID UNIQUE DEFAULT gen_random_uuid(),
    enviado_por UUID,
    aceito BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for better performance
CREATE INDEX idx_convites_email ON public.convites(email);

-- Create index on token for better performance  
CREATE INDEX idx_convites_token ON public.convites(token);