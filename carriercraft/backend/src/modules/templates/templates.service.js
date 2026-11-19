import { query } from '../../database/connection.js';

export class TemplatesService {
  async getTemplate(id) {
    const res = await query('SELECT * FROM templates WHERE id = $1', [id]);
    const template = res.rows[0];
    if (!template) {
      throw { status: 404, message: 'Template not found.' };
    }
    return template;
  }

  async saveTemplate(id, { name, htmlContent, cssContent, projectData }) {
    const projectJson = typeof projectData === 'object' ? JSON.stringify(projectData) : projectData || '{}';
    const res = await query(`
      UPDATE templates 
      SET name = COALESCE($1, name),
          html_content = COALESCE($2, html_content),
          css_content = COALESCE($3, css_content),
          project_data = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [name, htmlContent, cssContent, projectJson, id]);

    if (res.rowCount === 0) {
      throw { status: 404, message: 'Template not found.' };
    }
    return res.rows[0];
  }

  async listTemplates() {
    const res = await query('SELECT id, name, updated_at FROM templates ORDER BY id ASC');
    return res.rows;
  }
}

export const templatesService = new TemplatesService();
