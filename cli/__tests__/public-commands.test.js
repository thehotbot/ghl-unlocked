import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBlogSites, createBlogPost } from '../commands/blog.js';
import { listSocialPosts, getSocialAccounts } from '../commands/social.js';
import { listMedia, deleteMedia } from '../commands/media.js';
import { listEmailCampaigns, listEmailTemplates } from '../commands/emails.js';
import { listSurveys, getSurveySubmissions } from '../commands/surveys.js';
import { listObjectSchemas, createObjectRecord } from '../commands/objects.js';

describe('public API command domains', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      locationId: 'LOC_ABC',
      CONVERSATIONS_VERSION: '2021-04-15',
    };
  });

  // Blog
  it('getBlogSites calls GET /blogs/site/all with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ blogs: [] });
    await getBlogSites(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/blogs/site/all', { params: { locationId: 'LOC_ABC' } });
  });

  it('createBlogPost posts with locationId and data', async () => {
    mockClient.post.mockResolvedValueOnce({ id: 'p1' });
    await createBlogPost(mockClient, { title: 'Test', blogId: 'b1' });
    expect(mockClient.post).toHaveBeenCalledWith('/blogs/posts', { locationId: 'LOC_ABC', title: 'Test', blogId: 'b1' });
  });

  // Social
  it('listSocialPosts posts to /social-media-posting/{loc}/posts/list', async () => {
    mockClient.post.mockResolvedValueOnce({ posts: [] });
    await listSocialPosts(mockClient);
    expect(mockClient.post).toHaveBeenCalledWith('/social-media-posting/LOC_ABC/posts/list', {});
  });

  it('getSocialAccounts calls GET on accounts endpoint', async () => {
    mockClient.get.mockResolvedValueOnce({ accounts: [] });
    await getSocialAccounts(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/social-media-posting/LOC_ABC/accounts');
  });

  // Media
  it('listMedia calls GET /medias/files with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ files: [] });
    await listMedia(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/medias/files', { params: { locationId: 'LOC_ABC' } });
  });

  it('deleteMedia calls DELETE /medias/{id} with locationId', async () => {
    mockClient.delete.mockResolvedValueOnce({});
    await deleteMedia(mockClient, 'media1');
    expect(mockClient.delete).toHaveBeenCalledWith('/medias/media1', { params: { locationId: 'LOC_ABC' } });
  });

  // Emails
  it('listEmailCampaigns calls GET /emails/schedule with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ campaigns: [] });
    await listEmailCampaigns(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/emails/schedule', { params: { locationId: 'LOC_ABC' } });
  });

  it('listEmailTemplates calls GET /emails/builder with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ templates: [] });
    await listEmailTemplates(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/emails/builder', { params: { locationId: 'LOC_ABC' } });
  });

  // Surveys
  it('listSurveys calls GET /surveys/ with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ surveys: [] });
    await listSurveys(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/surveys/', { params: { locationId: 'LOC_ABC' } });
  });

  it('getSurveySubmissions calls GET with surveyId param', async () => {
    mockClient.get.mockResolvedValueOnce({ submissions: [] });
    await getSurveySubmissions(mockClient, { surveyId: 's1' });
    expect(mockClient.get).toHaveBeenCalledWith('/locations/LOC_ABC/surveys/submissions', { params: { surveyId: 's1' } });
  });

  // Custom Objects
  it('listObjectSchemas calls GET /objects/ with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ schemas: [] });
    await listObjectSchemas(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/objects/', { params: { locationId: 'LOC_ABC' } });
  });

  it('createObjectRecord posts to /objects/{key}/records with locationId', async () => {
    mockClient.post.mockResolvedValueOnce({ id: 'r1' });
    await createObjectRecord(mockClient, 'invoices', { amount: 100 });
    expect(mockClient.post).toHaveBeenCalledWith('/objects/invoices/records', { locationId: 'LOC_ABC', amount: 100 });
  });
});
