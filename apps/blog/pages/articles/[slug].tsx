import { Box, NotFound } from '@pancakeswap/uikit'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import ArticleInfo from 'components/Article/SingleArticle/ArticleInfo'
import HowItWork from 'components/Article/SingleArticle/HowItWork'
import SimilarArticles from 'components/Article/SingleArticle/SimilarArticles'
import PageMeta from 'components/PageMeta'
import { getArticle, getSingleArticle } from 'hooks/getArticle'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { filterTagArray } from 'utils/filterTagArray'
import { ArticleDataType } from '@pancakeswap/blog'

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps = (async ({ params, previewData }) => {
  const queryClient = new QueryClient()

  if (!params)
    return {
      redirect: {
        permanent: false,
        statusCode: 404,
        destination: '/404',
      },
    }

  const { slug } = params
  const isPreviewMode = (previewData as any)?.slug

  let name: any = { $notIn: filterTagArray }
  if (isPreviewMode) {
    name = { $eq: 'Preview' }
  }

  const article = await queryClient.fetchQuery({
    queryKey: ['/article', slug],
    queryFn: async () =>
      getSingleArticle({
        url: `/slugify/slugs/article/${slug}`,
        urlParamsObject: {
          populate: 'categories,image',
          locale: 'all',
          filters: {
            categories: {
              name,
            },
          },
        },
      }),
  })

  await queryClient.prefetchQuery({
    queryKey: ['/similarArticles', slug],
    queryFn: async () =>
      getArticle({
        url: '/articles',
        urlParamsObject: {
          locale: article.locale,
          sort: 'createAt:desc',
          populate: 'categories,image',
          pagination: { limit: 6 },
          filters: {
            id: {
              $not: article.id,
            },
            categories: {
              $or: article.categories.map((category) => ({
                name: {
                  $eq: category,
                },
              })),
            },
          },
        },
      }).then((result) => result.data),
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      fallback: {
        isPreviewMode: !!isPreviewMode,
      },
    },
    revalidate: 60,
  }
}) satisfies GetStaticProps

const ArticlePage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ fallback, dehydratedState }) => {
  const router = useRouter()
  const article = dehydratedState?.queries?.find((query) => query?.queryKey?.includes(router?.query?.slug))?.state
    ?.data as ArticleDataType
  if (!router.isFallback && !article?.title) {
    return (
      <NotFound LinkComp={Link}>
        <NextSeo title="404" />
      </NotFound>
    )
  }

  const { title, description, imgUrl } = article

  return (
    <>
      <PageMeta title={title} description={description} imgUrl={imgUrl} />
      <HydrationBoundary state={dehydratedState}>
        <Box>
          <ArticleInfo />
          {!fallback.isPreviewMode && (
            <>
              <HowItWork />
              <SimilarArticles />
            </>
          )}
        </Box>
      </HydrationBoundary>
    </>
  )
}

export default ArticlePage
