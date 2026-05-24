-- Replace this value with one of your authenticated user IDs before running.
with seed_user as (
  select '00000000-0000-0000-0000-000000000000'::uuid as id
),
product_rows as (
  insert into public.products (user_id, name, brand, category, platform, product_link, sample_status, notes)
  select id, 'GlowGrip Phone Tripod', 'Northline', 'Creator Gear', 'Amazon', 'https://amazon.com/example-tripod', 'received', 'Best for hands-free demos and beauty shots.'
  from seed_user
  union all
  select id, 'HydraMist Facial Sprayer', 'LumaSkin', 'Beauty', 'TikTok Shop', 'https://tiktok.com/shop/example-sprayer', 'received', 'Use before/after closeups and morning routine hooks.'
  from seed_user
  union all
  select id, 'StudioLite Mini Panel', 'BrightFrame', 'Creator Gear', 'Instagram', 'https://instagram.com/shop/example-light', 'requested', 'Compare natural light vs panel light.'
  from seed_user
  returning id, name
),
hook_rows as (
  insert into public.hooks (user_id, category, hook)
  select id, 'Problem/Solution', 'I did not realize this tiny upgrade was the reason my videos looked expensive.'
  from seed_user
  union all
  select id, 'Before/After', 'Here is what changed when I stopped filming my content like this.'
  from seed_user
  union all
  select id, 'Curiosity', 'This looks unnecessary until you try it for one week.'
  from seed_user
  returning id, hook
),
script_rows as (
  insert into public.scripts (user_id, product_id, title, hook, pain_point, voiceover, on_screen_text, cta, hashtags, status)
  select
    seed_user.id,
    product_rows.id,
    'Tripod desk setup upgrade',
    'I did not realize this tiny upgrade was the reason my videos looked expensive.',
    'Shaky desk videos make products look less trustworthy.',
    'I swapped my stack of books for this tripod and now my product demos are steadier, faster to film, and way easier to repeat.',
    'Before: shaky setup. After: clean demo angle.',
    'Tap the product link if you film at your desk.',
    array['#creatorgear', '#amazonfinds', '#contentcreator'],
    'scripted'
  from seed_user, product_rows
  where product_rows.name = 'GlowGrip Phone Tripod'
  union all
  select
    seed_user.id,
    product_rows.id,
    'Morning skin prep demo',
    'This looks unnecessary until you try it for one week.',
    'Skin prep products can look gimmicky without a simple demo.',
    'I keep this sprayer on my vanity because it makes my morning routine feel fresh and it shows beautifully on camera.',
    '3-second refresh before makeup.',
    'Save this for your next skincare reset.',
    array['#tiktokshop', '#skincaretools', '#morningroutine'],
    'filmed'
  from seed_user, product_rows
  where product_rows.name = 'HydraMist Facial Sprayer'
  returning id, title
)
insert into public.content_calendar (user_id, script_id, filming_date, post_date, platform, status, notes)
select seed_user.id, script_rows.id, current_date, current_date + 1, 'Amazon', 'filming', 'Film hook variations and close product shot.'
from seed_user, script_rows
where script_rows.title = 'Tripod desk setup upgrade'
union all
select seed_user.id, script_rows.id, current_date + 2, current_date + 4, 'TikTok Shop', 'scheduled', 'Add captions and pin product link.'
from seed_user, script_rows
where script_rows.title = 'Morning skin prep demo';

with seed_user as (
  select '00000000-0000-0000-0000-000000000000'::uuid as id
)
insert into public.performance (user_id, script_id, views, likes, comments, clicks, sales, notes)
select
  seed_user.id,
  scripts.id,
  18400,
  1210,
  86,
  342,
  19,
  'Strong watch time after the before/after opening.'
from seed_user
join public.scripts on scripts.user_id = seed_user.id
where scripts.title = 'Morning skin prep demo';
