
-- Support FAQ items (editable by admin)
CREATE TABLE public.support_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Support contact channels (editable by admin)
CREATE TABLE public.support_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type text NOT NULL, -- 'whatsapp', 'email', etc
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_contacts ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read support content
CREATE POLICY "Anyone can view FAQs" ON public.support_faqs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view contacts" ON public.support_contacts FOR SELECT TO authenticated USING (true);

-- Only admins can manage support content
CREATE POLICY "Admins can insert FAQs" ON public.support_faqs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update FAQs" ON public.support_faqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete FAQs" ON public.support_faqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert contacts" ON public.support_contacts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contacts" ON public.support_contacts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contacts" ON public.support_contacts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed initial FAQ data
INSERT INTO public.support_faqs (question, answer, sort_order) VALUES
('Como criar meu primeiro link?', 'Vá em ''Criar Link'' no menu lateral, escolha um template ou comece do zero. Preencha o nome do negócio, adicione botões e blocos, e clique em Salvar.', 0),
('Posso usar meu domínio personalizado?', 'Sim! No plano Pro ou Business você pode conectar seu domínio personalizado. Acesse Configurações para configurar.', 1),
('Qual o tamanho ideal para a arte do botão imagem?', 'O tamanho padrão é 348×110px. Ao recortar, o sistema já sugere essas dimensões automaticamente. Você pode criar sua arte no Canva com essas medidas.', 2),
('Como funciona o Analytics?', 'O Analytics mostra visualizações, cliques e taxa de conversão em tempo real. Cada link tem seus próprios dados de desempenho.', 3),
('Quantos links posso criar?', 'No plano Free: 3 links, Pro: 25 links, Business: ilimitado. Acesse a página de Planos para mais detalhes.', 4),
('Como adicionar efeitos visuais no meu link?', 'No editor, clique em ''Efeitos'' na barra superior. Você pode adicionar neve, emojis flutuantes e animações de entrada.', 5),
('Posso duplicar um link existente?', 'Sim! Na lista de links, clique nas opções do link e selecione ''Duplicar''. Uma cópia será criada com todas as configurações.', 6),
('O que são sub-páginas?', 'Sub-páginas são conteúdos adicionais vinculados a botões do seu link principal. Funcionam como páginas internas que abrem em modal.', 7);

-- Seed initial contact channels
INSERT INTO public.support_contacts (channel_type, title, description, url, sort_order) VALUES
('whatsapp', 'WhatsApp', 'Resposta em até 2 horas', 'https://wa.me/5500000000000', 0),
('email', 'E-mail', 'suporte@linkpro.com', 'mailto:suporte@linkpro.com', 1);

-- Allow admins to read all profiles (for user management)
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Allow admins to update any profile (e.g. change plans)
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Allow admins to view all links
CREATE POLICY "Admins can view all links" ON public.links FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
