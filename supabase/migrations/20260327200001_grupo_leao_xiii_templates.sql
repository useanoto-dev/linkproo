-- ══════════════════════════════════════════════════════════════════════════════
-- GRUPO LEÃO XIII — LinkPro Smart Templates
-- Gera os 5 minisites interligados do ecossistema Leão XIII
--
-- ANTES DE RODAR:
--   1. Substitua 'SEU_USER_ID' pelo UUID do seu usuário em:
--      Supabase Dashboard → Authentication → Users
--   2. Substitua 'https://SEU_DOMINIO' pelo domínio real da aplicação
--      Ex: https://linkproo.vercel.app  ou  https://app.seudominio.com.br
-- ══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_uid  UUID := '97803772-2ba7-4ced-96e9-ba2d6f4fd767';  -- ADM (business plan)
  v_base TEXT := 'https://linkproo.vercel.app';            -- domínio de produção

  -- slugs (altere se já existirem)
  s_posto    TEXT := 'postoleaoxiii';
  s_hotel    TEXT := 'hotelleaoxiii';
  s_bistro   TEXT := 'leaobistro';
  s_cfmoto   TEXT := 'cfmotoleaoxiii';
  s_shineray TEXT := 'shinerayma';

  -- Google Maps — complexo principal
  v_maps TEXT := 'https://maps.google.com/?q=Rua+Manoel+Trindade+341+Pedreiras+Maranhao';

  -- WhatsApp Hotel (único número confirmado na pesquisa)
  v_wa_hotel TEXT := 'https://wa.me/5599981361794';

BEGIN

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. POSTO LEÃO XIII
-- Combustível · Conveniência · Âncora do complexo
-- Cores: preto carbono → quente escuro, dourado #C9A227
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO public.links (
  user_id, slug, business_name, tagline,
  hero_image, hero_image_height_px, hero_image_opacity,
  hero_overlay_opacity, hero_overlay_color,
  logo_url, logo_size_px, logo_shape, logo_shadow,
  background_color, text_color, accent_color, font_family,
  business_name_font_size, business_name_align,
  entry_animation, is_active,
  buttons, blocks, badges, floating_emojis, pages
) VALUES (
  v_uid, s_posto,
  '🦁 Posto Leão XIII',
  'Combustível, Conveniência & o melhor complexo de Pedreiras em um só endereço',
  '', 220, 80, 45, '#000000',
  '', 88, 'circle', true,
  'linear-gradient(160deg, #0a0a0a 0%, #1c140a 100%)',
  'text-white', '#C9A227', 'Inter',
  26, 'center', 'fade-up', true,

  -- ── BOTÕES ────────────────────────────────────────────────────────────────
  jsonb_build_array(

    jsonb_build_object(
      'id','p1','order',1,
      'label','Fale Conosco',
      'subtitle','Atendimento via WhatsApp',
      'url', v_wa_hotel || '?text=Olá!+Vim+pelo+Posto+Leão+XIII',
      'linkType','whatsapp',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','💬','textAlign','left',
      'gradientColor','custom:#C9A227:#9a7515'
    ),

    jsonb_build_object(
      'id','p2','order',2,
      'label','Como Chegar',
      'subtitle','Rua Manoel Trindade, 341 – Pedreiras, MA',
      'url', v_maps,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','📍','textAlign','left',
      'gradientColor','custom:#1e3a2f:#0c1f18'
    ),

    jsonb_build_object(
      'id','p3','order',3,
      'label','Hotel Leão XIII',
      'subtitle','Hospedagem premium no mesmo complexo',
      'url', v_base || '/' || s_hotel,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🏨','textAlign','left',
      'gradientColor','custom:#1a2033:#0d1525'
    ),

    jsonb_build_object(
      'id','p4','order',4,
      'label','Leão Bistrô',
      'subtitle','Gastronomia & drinks – aberto a partir das 16h',
      'url', v_base || '/' || s_bistro,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🍷','textAlign','left',
      'gradientColor','custom:#3d1f10:#1f0f08'
    ),

    jsonb_build_object(
      'id','p5','order',5,
      'label','Instagram',
      'subtitle','@postoleaoxiii',
      'url','https://instagram.com/postoleaoxiii',
      'linkType','instagram',
      'buttonStyle','pill','buttonHeight',68,'buttonBorderRadius',50,
      'iconEmoji','📸','textAlign','center',
      'gradientColor','custom:#833ab4:#fd1d1d'
    )
  ),

  -- ── BLOCOS ────────────────────────────────────────────────────────────────
  jsonb_build_array(
    jsonb_build_object(
      'id','pb1','type','badges','order',1,
      'badges', jsonb_build_array(
        jsonb_build_object('id','b1','emoji','⛽','label','Combustível','color','bg-yellow-600'),
        jsonb_build_object('id','b2','emoji','🛒','label','Conveniência','color','bg-amber-700'),
        jsonb_build_object('id','b3','emoji','🏨','label','Hotel','color','bg-slate-700'),
        jsonb_build_object('id','b4','emoji','🍽️','label','Bistrô','color','bg-stone-700'),
        jsonb_build_object('id','b5','emoji','🅿️','label','Estacionamento','color','bg-zinc-700'),
        jsonb_build_object('id','b6','emoji','📍','label','Pedreiras – MA','color','bg-orange-900')
      )
    ),
    jsonb_build_object(
      'id','pb2','type','text','order',2,
      'content','O Posto Leão XIII é o ponto de referência do Grupo Leão XIII em Pedreiras. No mesmo complexo você encontra hotel, restaurante, conveniência — tudo num só lugar.',
      'textAlign','center'
    )
  ),
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  business_name = EXCLUDED.business_name, tagline = EXCLUDED.tagline,
  background_color = EXCLUDED.background_color, accent_color = EXCLUDED.accent_color,
  buttons = EXCLUDED.buttons, blocks = EXCLUDED.blocks,
  logo_size_px = EXCLUDED.logo_size_px, logo_shape = EXCLUDED.logo_shape,
  business_name_font_size = EXCLUDED.business_name_font_size,
  entry_animation = EXCLUDED.entry_animation, updated_at = now();


-- ──────────────────────────────────────────────────────────────────────────────
-- 2. HOTEL LEÃO XIII
-- Conforto premium · 18 quartos · Nota 9/10
-- Cores: azul marinho profundo → preto azulado, dourado #C9A227
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO public.links (
  user_id, slug, business_name, tagline,
  hero_image, hero_image_height_px, hero_image_opacity,
  hero_overlay_opacity, hero_overlay_color,
  logo_url, logo_size_px, logo_shape, logo_shadow,
  background_color, text_color, accent_color, font_family,
  business_name_font_size, business_name_align,
  entry_animation, is_active,
  buttons, blocks, badges, floating_emojis, pages
) VALUES (
  v_uid, s_hotel,
  '🦁 Hotel Leão XIII',
  'Conforto, modernidade e localização privilegiada no coração de Pedreiras',
  '', 240, 82, 50, '#0a0e1a',
  '', 90, 'circle', true,
  'linear-gradient(160deg, #0d1117 0%, #1a2033 100%)',
  'text-white', '#C9A227', 'Inter',
  26, 'center', 'fade-up', true,

  -- ── BOTÕES ────────────────────────────────────────────────────────────────
  jsonb_build_array(

    jsonb_build_object(
      'id','h1','order',1,
      'label','Fazer Reserva',
      'subtitle','Resposta rápida via WhatsApp',
      'url', v_wa_hotel || '?text=Olá!+Quero+fazer+uma+reserva+no+Hotel+Leão+XIII',
      'linkType','whatsapp',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🛏️','textAlign','left',
      'badgeLabel','RESERVAR','badgeColor','#C9A227',
      'gradientColor','custom:#C9A227:#9a7515'
    ),

    jsonb_build_object(
      'id','h2','order',2,
      'label','Como Chegar',
      'subtitle','Rua Manoel Trindade, 341 – Pedreiras, MA',
      'url', v_maps,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','📍','textAlign','left',
      'gradientColor','custom:#1e3a2f:#0c1f18'
    ),

    jsonb_build_object(
      'id','h3','order',3,
      'label','Leão Bistrô',
      'subtitle','Restaurante & bar dentro do hotel',
      'url', v_base || '/' || s_bistro,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🍷','textAlign','left',
      'gradientColor','custom:#3d1f10:#1f0f08'
    ),

    jsonb_build_object(
      'id','h4','order',4,
      'label','Posto Leão XIII',
      'subtitle','Abastecimento e conveniência ao lado',
      'url', v_base || '/' || s_posto,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','⛽','textAlign','left',
      'gradientColor','custom:#1c140a:#0a0a0a'
    ),

    jsonb_build_object(
      'id','h5','order',5,
      'label','Instagram',
      'subtitle','@hotelleaoxiii',
      'url','https://instagram.com/hotelleaoxiii',
      'linkType','instagram',
      'buttonStyle','pill','buttonHeight',68,'buttonBorderRadius',50,
      'iconEmoji','📸','textAlign','center',
      'gradientColor','custom:#833ab4:#fd1d1d'
    ),

    jsonb_build_object(
      'id','h6','order',6,
      'label','E-mail',
      'subtitle','hotelleaoxiii@hotmail.com',
      'url','mailto:hotelleaoxiii@hotmail.com',
      'linkType','email',
      'buttonStyle','minimal','buttonHeight',60,'buttonBorderRadius',10,
      'iconEmoji','✉️','textAlign','left',
      'gradientColor','custom:#1e2030:#141828'
    )
  ),

  -- ── BLOCOS ────────────────────────────────────────────────────────────────
  jsonb_build_array(
    jsonb_build_object(
      'id','hb1','type','badges','order',1,
      'badges', jsonb_build_array(
        jsonb_build_object('id','b1','emoji','🛏️','label','18 Quartos','color','bg-slate-700'),
        jsonb_build_object('id','b2','emoji','🍳','label','Café Incluso','color','bg-amber-800'),
        jsonb_build_object('id','b3','emoji','🚗','label','Estac. Grátis','color','bg-zinc-700'),
        jsonb_build_object('id','b4','emoji','📶','label','Wi-Fi Grátis','color','bg-blue-800'),
        jsonb_build_object('id','b5','emoji','⭐','label','Nota 9/10','color','bg-yellow-700'),
        jsonb_build_object('id','b6','emoji','🕐','label','24h Recepção','color','bg-stone-700')
      )
    ),
    jsonb_build_object(
      'id','hb2','type','text','order',2,
      'content','Hotel moderno, inaugurado em 2022, com quartos climatizados, Smart TV, café da manhã incluso, estacionamento gratuito e atendimento 24h. O melhor custo-benefício de Pedreiras.',
      'textAlign','center'
    )
  ),
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  business_name = EXCLUDED.business_name, tagline = EXCLUDED.tagline,
  background_color = EXCLUDED.background_color, accent_color = EXCLUDED.accent_color,
  buttons = EXCLUDED.buttons, blocks = EXCLUDED.blocks,
  logo_size_px = EXCLUDED.logo_size_px, logo_shape = EXCLUDED.logo_shape,
  business_name_font_size = EXCLUDED.business_name_font_size,
  entry_animation = EXCLUDED.entry_animation, updated_at = now();


-- ──────────────────────────────────────────────────────────────────────────────
-- 3. LEÃO BISTRÔ
-- Gastronomia & drinks · A partir das 16h · 5.5K seguidores
-- Cores: marrom escuro quente → quase preto, âmbar dourado #D4A017
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO public.links (
  user_id, slug, business_name, tagline,
  hero_image, hero_image_height_px, hero_image_opacity,
  hero_overlay_opacity, hero_overlay_color,
  logo_url, logo_size_px, logo_shape, logo_shadow,
  background_color, text_color, accent_color, font_family,
  business_name_font_size, business_name_align,
  entry_animation, is_active,
  buttons, blocks, badges, floating_emojis, pages
) VALUES (
  v_uid, s_bistro,
  '🦁 Leão Bistrô',
  'Gastronomia, drinks e ambiente sofisticado – aberto de terça a domingo a partir das 16h',
  '', 240, 80, 55, '#1a0800',
  '', 90, 'circle', true,
  'linear-gradient(160deg, #1a0f08 0%, #2d1810 100%)',
  'text-white', '#D4A017', 'Inter',
  26, 'center', 'fade-up', true,

  -- ── BOTÕES ────────────────────────────────────────────────────────────────
  jsonb_build_array(

    jsonb_build_object(
      'id','bi1','order',1,
      'label','Fazer Reserva',
      'subtitle','Confirme sua mesa pelo WhatsApp',
      'url', v_wa_hotel || '?text=Olá!+Quero+fazer+uma+reserva+no+Leão+Bistrô',
      'linkType','whatsapp',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🍷','textAlign','left',
      'badgeLabel','RESERVAR','badgeColor','#D4A017',
      'gradientColor','custom:#D4A017:#9a7510'
    ),

    jsonb_build_object(
      'id','bi2','order',2,
      'label','Cardápio Online',
      'subtitle','Peça delivery ou monte seu pedido',
      'url','https://pedido.anota.ai/loja/leao-bistro',
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🍽️','textAlign','left',
      'badgeLabel','DELIVERY','badgeColor','#e05a00',
      'gradientColor','custom:#8b3a0f:#4d1f08'
    ),

    jsonb_build_object(
      'id','bi3','order',3,
      'label','Como Chegar',
      'subtitle','Rua Manoel Trindade, 341 – Pedreiras, MA',
      'url', v_maps,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','📍','textAlign','left',
      'gradientColor','custom:#1e3a2f:#0c1f18'
    ),

    jsonb_build_object(
      'id','bi4','order',4,
      'label','Hotel Leão XIII',
      'subtitle','Hospede-se ao lado do Bistrô',
      'url', v_base || '/' || s_hotel,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🏨','textAlign','left',
      'gradientColor','custom:#1a2033:#0d1525'
    ),

    jsonb_build_object(
      'id','bi5','order',5,
      'label','Posto Leão XIII',
      'subtitle','Abastecimento no mesmo complexo',
      'url', v_base || '/' || s_posto,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','⛽','textAlign','left',
      'gradientColor','custom:#1c140a:#0a0a0a'
    ),

    jsonb_build_object(
      'id','bi6','order',6,
      'label','Instagram',
      'subtitle','@leaobistro',
      'url','https://instagram.com/leaobistro',
      'linkType','instagram',
      'buttonStyle','pill','buttonHeight',68,'buttonBorderRadius',50,
      'iconEmoji','📸','textAlign','center',
      'gradientColor','custom:#833ab4:#fd1d1d'
    )
  ),

  -- ── BLOCOS ────────────────────────────────────────────────────────────────
  jsonb_build_array(
    jsonb_build_object(
      'id','bib1','type','badges','order',1,
      'badges', jsonb_build_array(
        jsonb_build_object('id','b1','emoji','🍖','label','Pratos Especiais','color','bg-amber-800'),
        jsonb_build_object('id','b2','emoji','🍹','label','Drinks & Coquetéis','color','bg-orange-800'),
        jsonb_build_object('id','b3','emoji','🎵','label','Boa Música','color','bg-stone-700'),
        jsonb_build_object('id','b4','emoji','🕯️','label','Ambiente Único','color','bg-zinc-800'),
        jsonb_build_object('id','b5','emoji','🛵','label','Delivery','color','bg-red-800'),
        jsonb_build_object('id','b6','emoji','📍','label','Dentro do Hotel','color','bg-slate-700')
      )
    ),
    jsonb_build_object(
      'id','bib2','type','text','order',2,
      'content','O Leão Bistrô combina gastronomia sofisticada, drinks artesanais e um ambiente intimista que transforma cada visita em experiência. Localizado dentro do complexo Leão XIII.',
      'textAlign','center'
    )
  ),
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  business_name = EXCLUDED.business_name, tagline = EXCLUDED.tagline,
  background_color = EXCLUDED.background_color, accent_color = EXCLUDED.accent_color,
  buttons = EXCLUDED.buttons, blocks = EXCLUDED.blocks,
  logo_size_px = EXCLUDED.logo_size_px, logo_shape = EXCLUDED.logo_shape,
  business_name_font_size = EXCLUDED.business_name_font_size,
  entry_animation = EXCLUDED.entry_animation, updated_at = now();


-- ──────────────────────────────────────────────────────────────────────────────
-- 4. CFMOTO GRUPO LEÃO XIII
-- Concessionária premium CFMOTO · Motos e UTVs de alto desempenho
-- Cores: azul CFMOTO #0055A5 → preto azulado
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO public.links (
  user_id, slug, business_name, tagline,
  hero_image, hero_image_height_px, hero_image_opacity,
  hero_overlay_opacity, hero_overlay_color,
  logo_url, logo_size_px, logo_shape, logo_shadow,
  background_color, text_color, accent_color, font_family,
  business_name_font_size, business_name_align,
  entry_animation, is_active,
  buttons, blocks, badges, floating_emojis, pages
) VALUES (
  v_uid, s_cfmoto,
  '🦁 CFMOTO Leão XIII',
  'Concessionária oficial CFMOTO – Motos, ATVs e UTVs com qualidade global e identidade nordestina',
  '', 240, 85, 50, '#020d1f',
  '', 88, 'rounded', true,
  'linear-gradient(160deg, #030d1f 0%, #0a1535 100%)',
  'text-white', '#0055A5', 'Inter',
  26, 'center', 'fade-up', true,

  -- ── BOTÕES ────────────────────────────────────────────────────────────────
  jsonb_build_array(

    jsonb_build_object(
      'id','c1','order',1,
      'label','Falar com Vendas',
      'subtitle','Consulte modelos e condições pelo WhatsApp',
      'url', v_wa_hotel || '?text=Olá!+Tenho+interesse+em+uma+moto+CFMOTO',
      'linkType','whatsapp',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🏍️','textAlign','left',
      'badgeLabel','VENDAS','badgeColor','#0055A5',
      'gradientColor','custom:#0055A5:#003d80'
    ),

    jsonb_build_object(
      'id','c2','order',2,
      'label','Nossos Modelos',
      'subtitle','450MT, Naked, Adventure, ATVs e UTVs',
      'url','https://instagram.com/cfmoto.grupoleaoxiii',
      'linkType','instagram',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','📸','textAlign','left',
      'gradientColor','custom:#1a2540:#0d1a30'
    ),

    jsonb_build_object(
      'id','c3','order',3,
      'label','Como Chegar',
      'subtitle','Venha conhecer nossa loja',
      'url', v_maps,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','📍','textAlign','left',
      'gradientColor','custom:#1e3a2f:#0c1f18'
    ),

    jsonb_build_object(
      'id','c4','order',4,
      'label','Shineray Maranhão',
      'subtitle','Também somos dealer Shineray – motos mais baratas do Brasil',
      'url', v_base || '/' || s_shineray,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🔵','textAlign','left',
      'gradientColor','custom:#0170B9:#014f88'
    ),

    jsonb_build_object(
      'id','c5','order',5,
      'label','Experience More Together',
      'subtitle','Conheça o universo CFMOTO',
      'url','https://instagram.com/cfmoto.grupoleaoxiii',
      'linkType','instagram',
      'buttonStyle','pill','buttonHeight',68,'buttonBorderRadius',50,
      'iconEmoji','🔥','textAlign','center',
      'gradientColor','custom:#0055A5:#00346b'
    )
  ),

  -- ── BLOCOS ────────────────────────────────────────────────────────────────
  jsonb_build_array(
    jsonb_build_object(
      'id','cb1','type','badges','order',1,
      'badges', jsonb_build_array(
        jsonb_build_object('id','b1','emoji','🏍️','label','Motocicletas','color','bg-blue-800'),
        jsonb_build_object('id','b2','emoji','🚵','label','ATVs','color','bg-blue-900'),
        jsonb_build_object('id','b3','emoji','🚙','label','UTVs','color','bg-slate-800'),
        jsonb_build_object('id','b4','emoji','🌍','label','Marca Global','color','bg-indigo-800'),
        jsonb_build_object('id','b5','emoji','🔧','label','Assistência Técnica','color','bg-zinc-700'),
        jsonb_build_object('id','b6','emoji','🦁','label','Grupo Leão XIII','color','bg-amber-800')
      )
    ),
    jsonb_build_object(
      'id','cb2','type','text','order',2,
      'content','Concessionária autorizada CFMOTO no Nordeste. Levamos a qualidade global da marca para o interior do Maranhão com o atendimento personalizado do Grupo Leão XIII.',
      'textAlign','center'
    )
  ),
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  business_name = EXCLUDED.business_name, tagline = EXCLUDED.tagline,
  background_color = EXCLUDED.background_color, accent_color = EXCLUDED.accent_color,
  buttons = EXCLUDED.buttons, blocks = EXCLUDED.blocks,
  logo_size_px = EXCLUDED.logo_size_px, logo_shape = EXCLUDED.logo_shape,
  business_name_font_size = EXCLUDED.business_name_font_size,
  entry_animation = EXCLUDED.entry_animation, updated_at = now();


-- ──────────────────────────────────────────────────────────────────────────────
-- 5. SHINERAY MARANHÃO | LEÃO XIII
-- 8+ unidades no Maranhão · Única autorizada de Pedreiras e região
-- Cores: azul Shineray #0170B9 → escuro profundo
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO public.links (
  user_id, slug, business_name, tagline,
  hero_image, hero_image_height_px, hero_image_opacity,
  hero_overlay_opacity, hero_overlay_color,
  logo_url, logo_size_px, logo_shape, logo_shadow,
  background_color, text_color, accent_color, font_family,
  business_name_font_size, business_name_align,
  entry_animation, is_active,
  buttons, blocks, badges, floating_emojis, pages
) VALUES (
  v_uid, s_shineray,
  '🦁 Shineray Maranhão',
  'A única autorizada Shineray de Pedreiras – as motos mais baratas do Brasil com a força do Leão XIII',
  '', 240, 85, 50, '#020a18',
  '', 88, 'rounded', true,
  'linear-gradient(160deg, #031224 0%, #062348 100%)',
  'text-white', '#0170B9', 'Inter',
  26, 'center', 'fade-up', true,

  -- ── BOTÕES ────────────────────────────────────────────────────────────────
  jsonb_build_array(

    jsonb_build_object(
      'id','s1','order',1,
      'label','Falar com Vendas',
      'subtitle','Consulte modelos e condições – resposta rápida',
      'url', v_wa_hotel || '?text=Olá!+Tenho+interesse+em+uma+moto+Shineray',
      'linkType','whatsapp',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🏍️','textAlign','left',
      'badgeLabel','VENDAS','badgeColor','#0170B9',
      'gradientColor','custom:#0170B9:#014f88'
    ),

    jsonb_build_object(
      'id','s2','order',2,
      'label','Modelos Disponíveis',
      'subtitle','Flash 250F, Iron 250, Denver 250 e muito mais',
      'url','https://instagram.com/shineraymaranhaoleaoxiii',
      'linkType','instagram',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','📸','textAlign','left',
      'gradientColor','custom:#1a2540:#0d1a30'
    ),

    jsonb_build_object(
      'id','s3','order',3,
      'label','Como Chegar – Pedreiras',
      'subtitle','Rua Manoel Trindade, 341 – Pedreiras, MA',
      'url', v_maps,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','📍','textAlign','left',
      'gradientColor','custom:#1e3a2f:#0c1f18'
    ),

    jsonb_build_object(
      'id','s4','order',4,
      'label','CFMOTO Leão XIII',
      'subtitle','Também temos motos CFMOTO premium',
      'url', v_base || '/' || s_cfmoto,
      'linkType','external',
      'buttonStyle','card','buttonHeight',92,'buttonBorderRadius',14,
      'iconEmoji','🔵','textAlign','left',
      'gradientColor','custom:#0055A5:#003d80'
    ),

    jsonb_build_object(
      'id','s5','order',5,
      'label','Nossas Unidades',
      'subtitle','8+ unidades em todo o Maranhão',
      'url','https://instagram.com/shineraymaranhaoleaoxiii',
      'linkType','instagram',
      'buttonStyle','pill','buttonHeight',68,'buttonBorderRadius',50,
      'iconEmoji','🗺️','textAlign','center',
      'gradientColor','custom:#0170B9:#014f88'
    )
  ),

  -- ── BLOCOS ────────────────────────────────────────────────────────────────
  jsonb_build_array(
    jsonb_build_object(
      'id','sb1','type','badges','order',1,
      'badges', jsonb_build_array(
        jsonb_build_object('id','b1','emoji','🏍️','label','Motos Novas','color','bg-blue-800'),
        jsonb_build_object('id','b2','emoji','💰','label','Melhores Preços','color','bg-green-800'),
        jsonb_build_object('id','b3','emoji','🏆','label','Única Autorizada','color','bg-amber-800'),
        jsonb_build_object('id','b4','emoji','🔧','label','Assistência Técnica','color','bg-zinc-700'),
        jsonb_build_object('id','b5','emoji','📍','label','8+ Unidades no MA','color','bg-slate-700'),
        jsonb_build_object('id','b6','emoji','🦁','label','Grupo Leão XIII','color','bg-orange-900')
      )
    ),
    jsonb_build_object(
      'id','sb2','type','text','order',2,
      'content','A Shineray Leão XIII é a única concessionária autorizada Shineray de Pedreiras e região. Com 8 unidades em expansão pelo Maranhão, oferecemos as motos mais baratas do Brasil com qualidade e garantia.',
      'textAlign','center'
    )
  ),
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  business_name = EXCLUDED.business_name, tagline = EXCLUDED.tagline,
  background_color = EXCLUDED.background_color, accent_color = EXCLUDED.accent_color,
  buttons = EXCLUDED.buttons, blocks = EXCLUDED.blocks,
  logo_size_px = EXCLUDED.logo_size_px, logo_shape = EXCLUDED.logo_shape,
  business_name_font_size = EXCLUDED.business_name_font_size,
  entry_animation = EXCLUDED.entry_animation, updated_at = now();


RAISE NOTICE '✅ Grupo Leão XIII — 5 templates inseridos com sucesso!';
RAISE NOTICE '   • postoleaoxiii  → Posto Leão XIII';
RAISE NOTICE '   • hotelleaoxiii  → Hotel Leão XIII';
RAISE NOTICE '   • leaobistro     → Leão Bistrô';
RAISE NOTICE '   • cfmotoleaoxiii → CFMOTO Grupo Leão XIII';
RAISE NOTICE '   • shinerayma     → Shineray Maranhão | Leão XIII';
RAISE NOTICE '';
RAISE NOTICE '⚠️  PRÓXIMOS PASSOS:';
RAISE NOTICE '   1. Acesse o editor de cada link e faça upload dos logos e banners';
RAISE NOTICE '   2. Atualize o número de WhatsApp para cada negócio';
RAISE NOTICE '   3. Substitua v_base pelo domínio real nos botões de cross-link';

END $$;
