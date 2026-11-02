grant select, insert, update, delete on public.posts, public.books to authenticated;

drop policy if exists "Admin can manage posts" on public.posts;
create policy "Admin can manage posts"
  on public.posts
  for all
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'beerencetin@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'beerencetin@gmail.com');

drop policy if exists "Admin can manage books" on public.books;
create policy "Admin can manage books"
  on public.books
  for all
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'beerencetin@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'beerencetin@gmail.com');

drop policy if exists "Admin can read all posts" on public.posts;
create policy "Admin can read all posts"
  on public.posts
  for select
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'beerencetin@gmail.com');
