import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  BookMarked,
  Check,
  ChevronDown,
  Feather,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import blueShellImage from './assets/blue-shell.jpg'
import { supabase } from './lib/supabase'
import './App.css'

type Post = {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  image: string
  body: string
  published: boolean
}

type PostDraft = Pick<Post, 'title' | 'excerpt' | 'category' | 'image' | 'body'>

type ReadingBook = {
  id: string
  title: string
  author: string
  cover: string
  status: 'currently-reading' | 'last-read'
  progress: number
  date: string
}

type ReadingBookDraft = Omit<ReadingBook, 'id'>

const STORAGE_KEY = 'between-lines-posts'
const FAVORITES_KEY = 'between-lines-favorites'
const BOOKS_KEY = 'between-lines-books'
const BOOKS_SEED_KEY = 'between-lines-books-seeded-v1'
const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL?.trim().toLocaleLowerCase('en-US') || 'beerencetin@gmail.com'

const starterBooks: ReadingBook[] = [
  {
    id: 'currently-reading-blindness',
    title: 'Körlük',
    author: 'José Saramago',
    cover: 'https://api.bloomandfresh.com/storage/products/detail_image_750/01M1KDKHNZ43PJHBEES01663SS.png',
    status: 'currently-reading',
    progress: 0,
    date: '',
  },
  {
    id: 'last-read-vegetarian',
    title: 'Vejetaryen',
    author: 'Han Kang',
    cover: 'https://img.kitapyurdu.com/v1/getImage/fn:11983062/wi:500/wh:61cd29240',
    status: 'last-read',
    progress: 100,
    date: '2026-09-25',
  },
]

const starterPosts: Post[] = [
  {
    id: 'slow-down',
    title: 'Biraz yavaşlamak üzerine',
    excerpt: 'Hayatın hızına kısa bir ara vermek, bazen kendimize verebileceğimiz en güzel hediye.',
    category: 'Düşünceler',
    date: '02 Kasım 2026',
    readTime: '4 dk okuma',
    image:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1400&q=85',
    body: `Son zamanlarda her şeyin biraz daha hızlı olması gerektiğini düşünüyoruz. Daha hızlı cevaplar, daha dolu takvimler, araya sıkıştırılmış küçük molalar.\n\nOysa bazen en iyi yaptığımız şey, hiçbir yere yetişmeye çalışmadan olduğumuz yerde kalmak. Pencereden süzülen ışığı izlemek, kahvenin soğumasına izin vermek, bir cümleyi acele etmeden tamamlamak.\n\nYavaşlamak geride kalmak değil. Bazen kendimize yeniden yetişmenin tek yolu.`,
    published: true,
  },
  {
    id: 'small-moments',
    title: 'Küçük anların güzelliği',
    excerpt: 'Bir fincan kahve, açık bir pencere ve henüz adını koymadığımız o sakinlik.',
    category: 'Günlük',
    date: '31 Ekim 2026',
    readTime: '3 dk okuma',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1000&q=85',
    body: `Bazı günler, akılda kalan şey büyük bir olay olmuyor. Sabah mutfağa düşen ışık, yolda duyduğumuz bir şarkı ya da tam ihtiyacımız varken gelen kısa bir mesaj.\n\nBelki de güzel bir hayat, böyle küçük parçaların yan yana gelmesinden ibaret. Onları fark etmek için biraz durmak yeterli.`,
    published: true,
  },
  {
    id: 'sea-thoughts',
    title: 'Denize benzeyen düşünceler',
    excerpt: 'Bazı düşünceler kıyıya vurur, bazılarıysa sessizce uzaklaşır.',
    category: 'Hayat',
    date: '28 Ekim 2026',
    readTime: '5 dk okuma',
    image:
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1000&q=85',
    body: `Denizin kıyısında düşünceler de dalgalar gibi geliyor. Biri biraz kalıyor, diğeri iz bırakmadan geri çekiliyor.\n\nHepsini anlamlandırmak zorunda değiliz. Bazen yalnızca gelip geçmelerine izin vermek, içimizde yer açıyor.`,
    published: true,
  },
]

const emptyDraft: PostDraft = {
  title: '',
  excerpt: '',
  category: 'Düşünceler',
  image: '',
  body: '',
}

const emptyBookDraft: ReadingBookDraft = {
  title: '',
  author: '',
  cover: '',
  status: 'currently-reading',
  progress: 0,
  date: new Date().toISOString().slice(0, 10),
}

function readStoredPosts(): Post[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return starterPosts

  try {
    const parsed: unknown = JSON.parse(saved)
    if (Array.isArray(parsed)) return parsed as Post[]
    console.error('Kayıtlı yazılar beklenen biçimde değil; örnek yazılar gösteriliyor.')
  } catch (error) {
    console.error('Kayıtlı yazılar okunamadı; örnek yazılar gösteriliyor.', error)
  }
  return starterPosts
}

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
    return Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')
      ? parsed
      : []
  } catch (error) {
    console.error('Favoriler okunamadı.', error)
    return []
  }
}

function readBooks(): ReadingBook[] {
  const saved = localStorage.getItem(BOOKS_KEY)

  try {
    const parsed: unknown = JSON.parse(saved ?? '[]')
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (book) =>
          typeof book.id === 'string' &&
          typeof book.title === 'string' &&
          typeof book.author === 'string' &&
          typeof book.cover === 'string' &&
          (book.status === 'currently-reading' || book.status === 'last-read') &&
          typeof book.progress === 'number' &&
          typeof book.date === 'string',
      )
    ) {
      if (parsed.length === 0 && localStorage.getItem(BOOKS_SEED_KEY) !== 'true') {
        localStorage.setItem(BOOKS_SEED_KEY, 'true')
        return starterBooks
      }
      localStorage.setItem(BOOKS_SEED_KEY, 'true')
      return parsed
    }
    console.error('Kayıtlı kitaplar beklenen biçimde değil; boş liste gösteriliyor.')
  } catch (error) {
    console.error('Kayıtlı kitaplar okunamadı; boş liste gösteriliyor.', error)
  }
  localStorage.setItem(BOOKS_SEED_KEY, 'true')
  return saved ? [] : starterBooks
}

function BookCover({ book }: { book: ReadingBook }) {
  return (
    <div className="book-cover" aria-label={`${book.title} kitap kapağı`}>
      {book.cover ? <img src={book.cover} alt="" /> : <span className="cover-placeholder"><BookOpen size={22} /><span>BETWEEN<br />THE LINES</span></span>}
    </div>
  )
}

function mapPostRow(row: {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  read_time: string
  image: string
  body: string
  published: boolean
}): Post {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    body: row.body,
    published: row.published,
  }
}

function App() {
  const [posts, setPosts] = useState<Post[]>(readStoredPosts)
  const [favorites, setFavorites] = useState<string[]>(readFavorites)
  const [books, setBooks] = useState<ReadingBook[]>(readBooks)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tüm kategoriler')
  const [page, setPage] = useState('home')
  const [activePostId, setActivePostId] = useState('')
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [draft, setDraft] = useState<PostDraft>(emptyDraft)
  const [bookDraft, setBookDraft] = useState<ReadingBookDraft>(emptyBookDraft)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const [adminUser, setAdminUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(Boolean(supabase))
  const [loginEmail, setLoginEmail] = useState(ADMIN_EMAIL)
  const [loginPassword, setLoginPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isAdmin = Boolean(
    adminUser?.email &&
    ADMIN_EMAIL &&
    adminUser.email.toLocaleLowerCase('en-US') === ADMIN_EMAIL,
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books))
  }, [books])

  useEffect(() => {
    if (!supabase) return

    let active = true
    const client = supabase

    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        console.error('Oturum bilgisi alınamadı.', error)
        setAuthError('Oturum bilgisi alınamadı. Sayfayı yenileyip tekrar dene.')
      }
      setAdminUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user ?? null)
      setAuthLoading(false)
      setAuthError('')
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    const client = supabase

    let cancelled = false

    async function loadPublicContent() {
      let postsQuery = client
        .from('posts')
        .select('id, title, excerpt, category, date, read_time, image, body, published')
        .order('created_at', { ascending: false })
      if (!isAdmin) postsQuery = postsQuery.eq('published', true)

      const [postsResult, booksResult] = await Promise.all([
        postsQuery,
        client
          .from('books')
          .select('id, title, author, cover, status, progress, date')
          .order('date', { ascending: false }),
      ])

      if (cancelled) return

      const errors = [postsResult.error, booksResult.error].filter(Boolean)
      if (errors.length) {
        console.error('Supabase içerikleri yüklenemedi.', errors)
        setConnectionError('İçerikler veritabanından yüklenemedi; örnek içerik gösteriliyor. Lütfen daha sonra tekrar deneyin.')
      } else {
        setConnectionError('')
      }

      if (postsResult.data) {
        setPosts(postsResult.data.map(mapPostRow))
      }

      if (booksResult.data) {
        setBooks(
          booksResult.data.map((book) => ({
            ...book,
            date: book.date ?? '',
          })) as ReadingBook[],
        )
      }
    }

    void loadPublicContent()

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  useEffect(() => {
    const syncPage = () => {
      const [route, postId] = window.location.hash.slice(1).split('/')
      setPage(route || 'home')
      setActivePostId(postId ?? '')
      setMobileMenuOpen(false)
    }

    syncPage()
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  const categories = useMemo(
    () => ['Tüm kategoriler', ...new Set(posts.filter((post) => post.published).map((post) => post.category))],
    [posts],
  )

  const visiblePosts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('tr')
    return posts.filter((post) => {
      const matchesSearch =
        !normalizedSearch ||
        `${post.title} ${post.excerpt} ${post.category}`.toLocaleLowerCase('tr').includes(normalizedSearch)
      const matchesCategory = category === 'Tüm kategoriler' || post.category === category
      return post.published && matchesSearch && matchesCategory
    })
  }, [category, posts, search])

  const activePost = posts.find((post) => post.id === activePostId && post.published)

  function navigate(route: string) {
    window.location.hash = route
  }

  function toggleFavorite(postId: string) {
    setFavorites((current) =>
      current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId],
    )
  }

  function startNewPost() {
    setEditingPostId(null)
    setDraft(emptyDraft)
  }

  function editPost(post: Post) {
    setEditingPostId(post.id)
    setDraft({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      image: post.image,
      body: post.body,
    })
  }

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setAuthError('Supabase yapılandırması bulunamadı. Lütfen site yöneticisine haber ver.')
      return
    }
    if (loginEmail.trim().toLocaleLowerCase('en-US') !== ADMIN_EMAIL) {
      setAuthError('Bu e-posta yönetici hesabı olarak tanımlı değil.')
      return
    }
    setAuthError('')
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    })
    setAuthLoading(false)
    if (error) {
      console.error('Yönetici girişi başarısız.', error)
      setAuthError('Giriş yapılamadı. E-posta ve parolayı kontrol et.')
      return
    }
    setLoginPassword('')
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Oturum kapatılamadı.', error)
      setActionError('Oturum kapatılamadı. Lütfen tekrar dene.')
    }
  }

  async function savePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !isAdmin) return
    const cleanDraft = {
      ...draft,
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      category: draft.category.trim(),
      image: draft.image.trim(),
      body: draft.body.trim(),
    }
    if (!cleanDraft.title || !cleanDraft.body) return

    setIsSaving(true)
    setActionError('')
    const date = new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
    const payload = {
      title: cleanDraft.title,
      excerpt: cleanDraft.excerpt,
      category: cleanDraft.category,
      image: cleanDraft.image,
      body: cleanDraft.body,
      date: editingPostId ? posts.find((post) => post.id === editingPostId)?.date ?? date : date,
      read_time: `${Math.max(1, Math.ceil(cleanDraft.body.split(/\s+/).length / 200))} dk okuma`,
    }

    const result = editingPostId
      ? await supabase.from('posts').update(payload).eq('id', editingPostId).select().single()
      : await supabase
          .from('posts')
          .insert({ ...payload, id: crypto.randomUUID(), published: false })
          .select()
          .single()

    setIsSaving(false)
    if (result.error) {
      console.error('Yazı Supabase’e kaydedilemedi.', result.error)
      setActionError(`Yazı kaydedilemedi: ${result.error.message}`)
      return
    }
    const savedPost = mapPostRow(result.data)
    setPosts((current) =>
      editingPostId
        ? current.map((post) => (post.id === editingPostId ? savedPost : post))
        : [savedPost, ...current],
    )
    startNewPost()
  }

  async function togglePublished(postId: string) {
    if (!supabase || !isAdmin) return
    const post = posts.find((item) => item.id === postId)
    if (!post) return
    setActionError('')
    const { data, error } = await supabase
      .from('posts')
      .update({ published: !post.published })
      .eq('id', postId)
      .select()
      .single()
    if (error) {
      console.error('Yazı yayın durumu güncellenemedi.', error)
      setActionError(`Yayın durumu değiştirilemedi: ${error.message}`)
      return
    }
    const savedPost = mapPostRow(data)
    setPosts((current) => current.map((item) => (item.id === postId ? savedPost : item)))
  }

  async function deletePost(postId: string) {
    if (!supabase || !isAdmin) return
    setActionError('')
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      console.error('Yazı silinemedi.', error)
      setActionError(`Yazı silinemedi: ${error.message}`)
      return
    }
    setPosts((current) => current.filter((post) => post.id !== postId))
    setFavorites((current) => current.filter((id) => id !== postId))
    if (editingPostId === postId) startNewPost()
  }

  function resetBookForm() {
    setEditingBookId(null)
    setBookDraft(emptyBookDraft)
  }

  function editBook(book: ReadingBook) {
    setEditingBookId(book.id)
    setBookDraft({
      title: book.title,
      author: book.author,
      cover: book.cover,
      status: book.status,
      progress: book.progress,
      date: book.date,
    })
  }

  async function saveBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !isAdmin) return
    const cleanBook = {
      ...bookDraft,
      title: bookDraft.title.trim(),
      author: bookDraft.author.trim(),
      cover: bookDraft.cover.trim(),
      progress: Math.max(0, Math.min(100, Number(bookDraft.progress) || 0)),
    }
    if (!cleanBook.title || !cleanBook.author) return

    setIsSaving(true)
    setActionError('')
    const payload = {
      title: cleanBook.title,
      author: cleanBook.author,
      cover: cleanBook.cover,
      status: cleanBook.status,
      progress: cleanBook.progress,
      date: cleanBook.date || null,
    }
    const result = editingBookId
      ? await supabase.from('books').update(payload).eq('id', editingBookId).select().single()
      : await supabase
          .from('books')
          .insert({ ...payload, id: crypto.randomUUID() })
          .select()
          .single()

    setIsSaving(false)
    if (result.error) {
      console.error('Kitap Supabase’e kaydedilemedi.', result.error)
      setActionError(`Kitap kaydedilemedi: ${result.error.message}`)
      return
    }
    const savedBook = { ...result.data, date: result.data.date ?? '' } as ReadingBook
    setBooks((current) =>
      editingBookId
        ? current.map((book) => (book.id === editingBookId ? savedBook : book))
        : [...current, savedBook],
    )
    resetBookForm()
  }

  async function deleteBook(bookId: string) {
    if (!supabase || !isAdmin) return
    setActionError('')
    const { error } = await supabase.from('books').delete().eq('id', bookId)
    if (error) {
      console.error('Kitap silinemedi.', error)
      setActionError(`Kitap silinemedi: ${error.message}`)
      return
    }
    setBooks((current) => current.filter((book) => book.id !== bookId))
    if (editingBookId === bookId) resetBookForm()
  }

  const publishedCount = posts.filter((post) => post.published).length
  const draftCount = posts.length - publishedCount

  if (page === 'admin' && authLoading) {
    return (
      <main className="admin-login-shell">
        <section className="admin-login-card">
          <span className="brand-mark"><Feather size={17} /></span>
          <p className="eyebrow">BETWEEN LINES</p>
          <h1>Yönetim paneli açılıyor</h1>
          <p className="admin-subtitle">Güvenli oturum kontrol ediliyor…</p>
        </section>
      </main>
    )
  }

  if (page === 'admin' && !isAdmin) {
    return (
      <main className="admin-login-shell">
        <form className="admin-login-card" onSubmit={signIn}>
          <a className="login-back-link" href="#"><ArrowLeft size={15} /> Bloga dön</a>
          <span className="brand-mark"><Feather size={17} /></span>
          <p className="eyebrow">YALNIZCA YÖNETİCİ</p>
          <h1>{adminUser ? 'Bu hesap yetkili değil' : 'Yazı masana dön.'}</h1>
          <p className="admin-subtitle">
            {adminUser
              ? `Yönetim erişimi ${ADMIN_EMAIL} hesabına tanımlı.`
              : 'Blogunu yönetmek için hesabınla giriş yap.'}
          </p>
          {!adminUser && (
            <>
              <label>E-posta<input type="email" autoComplete="username" required value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} /></label>
              <label>Parola<input type="password" autoComplete="current-password" required value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} /></label>
            </>
          )}
          {authError && <p className="connection-notice" role="alert">{authError}</p>}
          {actionError && <p className="connection-notice" role="alert">{actionError}</p>}
          {!supabase && <p className="connection-notice" role="alert">Supabase bağlantı ayarları yüklenemedi.</p>}
          {adminUser ? (
            <button type="button" className="primary-button" onClick={() => void signOut()}>Başka hesapla giriş yap</button>
          ) : (
            <button type="submit" className="primary-button" disabled={!supabase || authLoading}>
              <LockKeyhole size={15} /> Giriş yap
            </button>
          )}
        </form>
      </main>
    )
  }

  if (page === 'admin') {
    return (
      <main className="admin-shell">
        <aside className="admin-sidebar">
          <a className="admin-brand" href="#" onClick={() => navigate('home')}>
            <span className="brand-mark"><Feather size={17} /></span>
            <span>BETWEEN LINES<small>YAZI ATÖLYESİ</small></span>
          </a>
          <p className="sidebar-label">ÇALIŞMA ALANI</p>
          <button className="sidebar-link active"><LayoutDashboard size={17} /> Genel bakış</button>
          <button className="sidebar-link" onClick={startNewPost}><Plus size={17} /> Yeni yazı</button>
          <div className="sidebar-bottom">
            <span className="sidebar-label">GÖRÜNÜM</span>
            <button className="sidebar-link" onClick={() => navigate('home')}><ArrowUpRight size={17} /> Blogu görüntüle</button>
            <div className="admin-user"><span className="avatar">B</span><span>Blog yazarı<small>Yerel önizleme</small></span><Settings2 size={16} /></div>
          </div>
        </aside>

        <section className="admin-main">
          <header className="admin-topbar">
            <div><span className="breadcrumb">Yönetim paneli</span><span className="breadcrumb-divider">/</span><strong>Genel bakış</strong></div>
            <div className="admin-topbar-actions"><span className="preview-badge"><span /> SUPABASE’E BAĞLI</span><button className="sign-out-button" onClick={() => void signOut()}>Çıkış yap</button></div>
          </header>
          <div className="admin-content">
            <div className="admin-heading-row">
              <div>
                <p className="eyebrow">YAZI MASANA HOŞ GELDİN</p>
                <h1>Günaydın, yazar.</h1>
                <p className="admin-subtitle">Aklındaki kelimelere burada yer aç.</p>
              </div>
              <button className="primary-button" onClick={startNewPost}><Plus size={17} /> Yeni yazı oluştur</button>
            </div>

            <div className="local-warning"><LockKeyhole size={18} /><p><strong>Yönetici oturumu açık: {adminUser?.email}</strong> Yazı ve kitap değişiklikleri Supabase veritabanına kaydedilir.</p></div>
            {connectionError && <p className="connection-notice" role="alert">{connectionError}</p>}
            {actionError && <p className="connection-notice" role="alert">{actionError}</p>}

            <div className="stats-grid">
              <article className="stat-card"><span>YAYINLANAN YAZI</span><strong>{publishedCount}</strong><small><Check size={14} /> Blogda yayında</small></article>
              <article className="stat-card"><span>TASLAK</span><strong>{draftCount}</strong><small><Bookmark size={14} /> Üzerinde çalışılıyor</small></article>
              <article className="stat-card"><span>FAVORİLER</span><strong>{favorites.length}</strong><small><Heart size={14} /> Okuyucuların seçimi</small></article>
            </div>

            <div className="editor-layout">
              <section className="panel-card post-manager">
                <div className="panel-heading"><div><p className="eyebrow">İÇERİK</p><h2>Yazıların</h2></div><span className="count-pill">{posts.length} yazı</span></div>
                <div className="managed-posts">
                  {posts.map((post) => (
                    <article className="managed-post" key={post.id}>
                      <div className="managed-post-copy">
                        <span className={post.published ? 'status status-live' : 'status status-draft'}>{post.published ? 'YAYINDA' : 'TASLAK'}</span>
                        <h3>{post.title || 'Başlıksız yazı'}</h3>
                        <span>{post.category} <i>·</i> {post.date}</span>
                      </div>
                      <div className="managed-actions">
                        <button className="text-button" onClick={() => editPost(post)}>Düzenle</button>
                        <button className="icon-button danger" aria-label={`${post.title} yazısını sil`} onClick={() => deletePost(post.id)}><Trash2 size={16} /></button>
                        <button className="publish-toggle" onClick={() => togglePublished(post.id)}>{post.published ? 'Yayından kaldır' : 'Yayınla'}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel-card editor-card">
                <div className="panel-heading"><div><p className="eyebrow">{editingPostId ? 'DÜZENLEME' : 'YENİ TASLAK'}</p><h2>{editingPostId ? 'Yazıyı düzenle' : 'Hızlı yazı'}</h2></div><span className="editor-icon"><Feather size={18} /></span></div>
                <form className="post-form" onSubmit={savePost}>
                  <label>Başlık<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Yazına bir başlık ver" /></label>
                  <label>Kısa açıklama<textarea rows={2} value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} placeholder="Okura küçük bir ipucu..." /></label>
                  <label>Kategori<input required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Örn. Günlük" /></label>
                  <label>Kapak görseli URL<input type="url" value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="https://..." /></label>
                  <label>Yazı<textarea required rows={7} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Aklından geçenleri yaz..." /></label>
                  <div className="form-actions"><button type="button" className="secondary-button" onClick={startNewPost}>Temizle</button><button type="submit" className="primary-button" disabled={isSaving}><Check size={16} /> {isSaving ? 'Kaydediliyor…' : editingPostId ? 'Değişiklikleri kaydet' : 'Taslağı kaydet'}</button></div>
                </form>
              </section>
            </div>

            <section className="panel-card reading-manager">
              <div className="panel-heading">
                <div><p className="eyebrow">OKUMA GÜNLÜĞÜ</p><h2>Kitaplığım</h2></div>
                <span className="count-pill">{books.length} kitap</span>
              </div>
              <div className="reading-admin-layout">
                <div className="managed-books">
                  {books.length === 0 && <p className="empty-books-hint">Henüz kitap eklemedin. Şu an okuduklarını ve en son bitirdiklerini buradan paylaşabilirsin.</p>}
                  {books.map((book) => (
                    <article className="managed-book" key={book.id}>
                      <span className={`book-status ${book.status}`}>{book.status === 'currently-reading' ? 'ŞU AN OKUYORUM' : 'SON OKUDUKLARIMDAN'}</span>
                      <strong>{book.title}</strong>
                      <small>{book.author}</small>
                      {book.status === 'currently-reading' && <span className="managed-progress">%{book.progress} tamamlandı</span>}
                      <div className="managed-book-actions">
                        <button className="text-button" onClick={() => editBook(book)}>Düzenle</button>
                        <button className="icon-button danger" aria-label={`${book.title} kitabını sil`} onClick={() => deleteBook(book.id)}><Trash2 size={15} /></button>
                      </div>
                    </article>
                  ))}
                </div>
                <form className="post-form book-form" onSubmit={saveBook}>
                  <p className="book-form-title">{editingBookId ? 'Kitabı düzenle' : 'Kitap ekle'}</p>
                  <label>Kitap adı<input required value={bookDraft.title} onChange={(event) => setBookDraft({ ...bookDraft, title: event.target.value })} placeholder="Kitabın adı" /></label>
                  <label>Yazar<input required value={bookDraft.author} onChange={(event) => setBookDraft({ ...bookDraft, author: event.target.value })} placeholder="Yazarın adı" /></label>
                  <label>Kapak görseli URL<input type="url" value={bookDraft.cover} onChange={(event) => setBookDraft({ ...bookDraft, cover: event.target.value })} placeholder="İsteğe bağlı: https://..." /></label>
                  <div className="book-form-row">
                    <label>Okuma durumu<select value={bookDraft.status} onChange={(event) => setBookDraft({ ...bookDraft, status: event.target.value as ReadingBook['status'] })}><option value="currently-reading">Şu an okuyorum</option><option value="last-read">Son okuduklarımdan</option></select></label>
                    <label>{bookDraft.status === 'currently-reading' ? 'İlerleme (%)' : 'Okuma tarihi'}{bookDraft.status === 'currently-reading' ? <input type="number" min="0" max="100" value={bookDraft.progress} onChange={(event) => setBookDraft({ ...bookDraft, progress: Number(event.target.value) })} /> : <input type="date" value={bookDraft.date} onChange={(event) => setBookDraft({ ...bookDraft, date: event.target.value })} />}</label>
                  </div>
                  <div className="form-actions"><button type="button" className="secondary-button" onClick={resetBookForm}>Temizle</button><button type="submit" className="primary-button" disabled={isSaving}><Check size={15} /> {isSaving ? 'Kaydediliyor…' : editingBookId ? 'Kaydet' : 'Kitabı ekle'}</button></div>
                </form>
              </div>
            </section>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <main className="site-frame">
        <header className="site-header">
          <a className="wordmark" href="#" onClick={() => navigate('home')}>
            <span className="wordmark-icon"><Feather size={19} strokeWidth={1.7} /></span>
            <span>BETWEEN <i>LINES</i><small>NOTLAR, ANILAR VE KÜÇÜK ŞEYLER</small></span>
          </a>
          <button className="mobile-menu-button" aria-label="Menüyü aç" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
          <nav className={mobileMenuOpen ? 'main-nav nav-open' : 'main-nav'}>
            <a className={page === 'home' || page === 'post' ? 'nav-active' : ''} href="#" onClick={() => navigate('home')}>Yazılar</a>
            <a className={page === 'about' ? 'nav-active' : ''} href="#about" onClick={() => navigate('about')}>Hakkımda</a>
            <a className="nav-note" href="#admin" onClick={() => navigate('admin')} aria-label="Yönetim panelini aç"><LayoutDashboard size={16} /></a>
          </nav>
        </header>

        {page === 'post' && activePost ? (
          <article className="article-page">
            <button className="back-link" onClick={() => navigate('home')}><ArrowLeft size={16} /> Tüm yazılara dön</button>
            <div className="article-cover" style={{ backgroundImage: `url("${activePost.image}")` }} />
            <div className="article-content">
              <span className="article-category">{activePost.category}</span>
              <h1>{activePost.title}</h1>
              <p className="article-deck">{activePost.excerpt}</p>
              <div className="article-meta">{activePost.date}<span>·</span>{activePost.readTime}</div>
              <div className="article-body">{activePost.body.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              <button className={favorites.includes(activePost.id) ? 'favorite-button favorite-active' : 'favorite-button'} onClick={() => toggleFavorite(activePost.id)}><Heart size={17} fill={favorites.includes(activePost.id) ? 'currentColor' : 'none'} /> {favorites.includes(activePost.id) ? 'Favorilerimde' : 'Bu yazıyı kaydet'}</button>
            </div>
          </article>
        ) : page === 'about' ? (
          <section className="about-page">
            <div className="about-kicker"><Sparkles size={16} /> BİR KÜÇÜK MERHABA</div>
            <h1>Merhaba, ben<br /><em>bu satırların</em> yazarı.</h1>
            <p className="about-lead">Between Lines; kelimelerin, anıların ve hayatın arasından topladığım küçük parçalar için açtığım sakin bir köşe.</p>
            <div className="about-divider" />
            <p>Burada bazen yavaşlamak üzerine, bazen de sıradan bir günün içinden sızan güzel bir an üzerine yazıyorum. Bir fincan kahven varsa, hoş geldin.</p>
            <button className="primary-button" onClick={() => navigate('home')}>Yazıları keşfet <ArrowRight size={16} /></button>
          </section>
        ) : (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="hero-overline"><span /> KELİMELERİN ARASINDA BİR YER</span>
                <h1>Stories <i>&</i><br />Thoughts<span>.</span></h1>
                <p>Kelimeler, anılar ve hayatın arasından<br className="desktop-break" /> küçük parçalar.</p>
                <a className="discover-link" href="#stories" onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}>Yazıları keşfet <ArrowDown size={15} /></a>
              </div>
              <div className="hero-art">
                <div className="hero-photo">
                  <img src={blueShellImage} alt="Koyu mavi fonda ışıldayan mavi deniz kabuğu" />
                  <span className="photo-caption">DENİZİN SESSİZLİĞİ</span>
                </div>
                <div className="hero-stamp"><span>EST.</span><strong>20<br />26</strong><i>✳</i></div>
                <span className="hero-scribble">take your time</span>
              </div>
              <span className="hero-index">01 — 03</span>
            </section>

            {connectionError && <p className="connection-notice" role="alert">{connectionError}</p>}

            <section className="reading-shelf" aria-labelledby="reading-title">
              <div className="reading-heading">
                <div><span className="eyebrow">KİTAPLIĞIMDAN</span><h2 id="reading-title">Aralarda, kitaplarla.</h2></div>
                <span className="reading-heading-note">Okuduklarım ve aklımda kalanlar.</span>
              </div>
              <div className="reading-columns">
                <section className="reading-column" aria-labelledby="currently-reading-title">
                  <div className="reading-column-heading"><BookOpen size={16} /><h3 id="currently-reading-title">Currently reading</h3><span>{books.filter((book) => book.status === 'currently-reading').length.toString().padStart(2, '0')}</span></div>
                  {books.filter((book) => book.status === 'currently-reading').length ? (
                    <div className="reading-book-list">
                      {books.filter((book) => book.status === 'currently-reading').map((book) => (
                        <article className="reading-book" key={book.id}>
                          <BookCover book={book} />
                          <div className="reading-book-info"><span className="book-kicker">ŞU AN OKUYORUM</span><h4>{book.title}</h4><p>{book.author}</p><div className="progress-label"><span>Okuma ilerlemesi</span><span>%{book.progress}</span></div><div className="progress-track"><span style={{ width: `${book.progress}%` }} /></div></div>
                        </article>
                      ))}
                    </div>
                  ) : <p className="reading-empty">Şu sıralar okuduğum kitaplar burada olacak.</p>}
                </section>
                <section className="reading-column last-reading" aria-labelledby="last-reading-title">
                  <div className="reading-column-heading"><BookMarked size={16} /><h3 id="last-reading-title">Last read</h3><span>{books.filter((book) => book.status === 'last-read').length.toString().padStart(2, '0')}</span></div>
                  {books.filter((book) => book.status === 'last-read').length ? (
                    <div className="reading-book-list">
                      {books.filter((book) => book.status === 'last-read').map((book) => (
                        <article className="reading-book last-book" key={book.id}>
                          <BookCover book={book} />
                          <div className="reading-book-info"><span className="book-kicker">SON OKUDUKLARIMDAN</span><h4>{book.title}</h4><p>{book.author}</p><span className="book-finished-date">{book.date ? new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${book.date}T12:00:00`)) : 'Okuma günlüğümden'}</span></div>
                        </article>
                      ))}
                    </div>
                  ) : <p className="reading-empty">Bitirdiğim son kitaplar burada birikecek.</p>}
                </section>
              </div>
              <button className="reading-manage-link" onClick={() => navigate('admin')}><span>Okuma günlüğüm</span><ArrowUpRight size={14} /></button>
            </section>

            <section className="stories-section" id="stories">
              <div className="section-heading">
                <div><span className="eyebrow">SON NOTLAR</span><h2>Okumak için<br className="mobile-break" /> bir şeyler.</h2></div>
                <span className="section-note">Yavaşça oku. Kendinden bir parça bul.</span>
              </div>
              <div className="filter-bar">
                <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Yazılarda ara..." aria-label="Yazılarda ara" />{search && <button aria-label="Aramayı temizle" onClick={() => setSearch('')}><X size={15} /></button>}</label>
                <label className="category-select"><span className="sr-only">Kategori seç</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></label>
              </div>

              {visiblePosts.length ? (
                <div className="story-grid">
                  {visiblePosts.map((post, index) => (
                    <article className={`story-card story-card-${index % 3}`} key={post.id}>
                      <button className="story-image" onClick={() => navigate(`post/${post.id}`)} aria-label={`${post.title} yazısını oku`}>
                        <img src={post.image || 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=80'} alt="" loading="lazy" />
                        <span className="image-number">0{index + 1}</span>
                        <span className="image-arrow"><ArrowUpRight size={18} /></span>
                      </button>
                      <div className="story-copy">
                        <div className="story-meta"><span>{post.category}</span><i />{post.date}</div>
                        <div className="story-title-row"><button className="story-title" onClick={() => navigate(`post/${post.id}`)}>{post.title}</button><button className={favorites.includes(post.id) ? 'save-button saved' : 'save-button'} aria-label={favorites.includes(post.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'} onClick={() => toggleFavorite(post.id)}><Heart size={17} fill={favorites.includes(post.id) ? 'currentColor' : 'none'} /></button></div>
                        <p>{post.excerpt}</p>
                        <button className="read-link" onClick={() => navigate(`post/${post.id}`)}>Devamını oku <ArrowRight size={15} /></button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><Search size={24} /><h3>Burada henüz bir not yok.</h3><p>Başka bir kelime ya da kategoriyle tekrar deneyebilirsin.</p><button className="text-button" onClick={() => { setSearch(''); setCategory('Tüm kategoriler') }}>Filtreleri temizle</button></div>
              )}
            </section>

            <section className="newsletter">
              <div className="newsletter-mark"><Feather size={19} /></div>
              <div><span className="eyebrow">İLETİŞİM</span><h2>Bana ulaşın.</h2></div>
              <a href="mailto:beerencetin@gmail.com">beerencetin@gmail.com <ArrowUpRight size={16} /></a>
            </section>
          </>
        )}

        <footer className="site-footer">
          <a className="footer-wordmark" href="#" onClick={() => navigate('home')}>BETWEEN <i>LINES</i></a>
          <span>© 2026 BETWEEN LINES. KELİMELERLE, ÖZENLE.</span>
          <button onClick={() => navigate('admin')}>Yönetim paneli <ArrowUpRight size={13} /></button>
        </footer>
      </main>
    </div>
  )
}

export default App
