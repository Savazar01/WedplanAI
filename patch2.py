import re

path = r'c:\Users\AVASA\Downloads\OpenC\lvzday4\src\app\actions\wedding.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add imports
c = c.replace(
    'import { weddings, tasks, rituals, kanbanColumns, weddingTraditions, taskCategories, cateringMenus } from "@/db/schema";',
    'import { weddings, tasks, rituals, kanbanColumns, weddingTraditions, taskCategories, cateringMenus, users, emailConfigurations } from "@/db/schema";'
)
c = c.replace(
    'import { getServerSession } from "@/lib/auth-server";',
    'import { getServerSession } from "@/lib/auth-server";\nimport { auth } from "@/lib/auth";\nimport { sendEmail } from "@/lib/mailer";'
)

# 2. Update createWeddingSchema
c = c.replace(
    '  partnerA: z.string().min(1, "Partner A name is required"),\n  partnerB: z.string().min(1, "Partner B name is required"),',
    '  partnerA: z.string().min(1, "Partner A name is required"),\n  partnerAParents: z.string().optional(),\n  partnerB: z.string().min(1, "Partner B name is required"),\n  partnerBParents: z.string().optional(),\n  teamMembers: z.array(z.object({ name: z.string(), email: z.string(), password: z.string() })).optional(),'
)

# 3. Update createWeddingAction signature
c = c.replace(
    '  partnerA: string;\n  partnerB: string;',
    '  partnerA: string;\n  partnerAParents?: string;\n  partnerB: string;\n  partnerBParents?: string;\n  teamMembers?: { name: string; email: string; password: string }[];'
)

# 4. Update destructuring
c = c.replace(
    '  const { partnerA, partnerB, tradition',
    '  const { partnerA, partnerAParents, partnerB, partnerBParents, teamMembers, tradition'
)

# 5. Insert parents to weddings
c = c.replace(
    '        partnerA,\n        partnerB,',
    '        partnerA,\n        partnerAParents: partnerAParents || null,\n        partnerB,\n        partnerBParents: partnerBParents || null,'
)

# 6. Team members creation after transaction
creation_code = '''
    if (newlyCreatedWeddingId && teamMembers && teamMembers.length > 0) {
      const [emailConfig] = await db
        .select()
        .from(emailConfigurations)
        .where(eq(emailConfigurations.isActive, true))
        .limit(1);
      
      const emailActive = emailConfig && emailConfig.provider !== "disabled";

      for (const tm of teamMembers) {
        try {
          const result = await auth.api.signUpEmail({
            body: {
              name: tm.name,
              email: tm.email,
              password: tm.password,
              persona: "diy",
            },
          });
          
          if (result && result.user) {
            await db.update(users)
              .set({
                role: "user",
                weddingId: newlyCreatedWeddingId,
                weddingAccess: "all",
                shouldChangePassword: true,
              })
              .where(eq(users.id, result.user.id));
            
            if (emailActive) {
              await sendEmail({
                to: tm.email,
                subject: "Your WedplanAI Account Credentials",
                html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #6771ab;">Welcome to Wedding Task Planner!</h2>
                    <p>Hello ${tm.name},</p>
                    <p>You have been invited to help plan a wedding. Here are your login credentials:</p>
                    <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin: 20px 0;">
                      <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Email</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${tm.email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Password</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${tm.password}</td>
                      </tr>
                    </table>
                    <p>Please log in and you will be prompted to change your password immediately.</p>
                  </div>
                `,
              }).catch(e => console.error("Email error:", e));
            }
          }
        } catch (e) {
          console.error("Error creating team member", tm.email, e);
        }
      }
    }
'''
c = c.replace(
    '    return { success: true, weddingId: newlyCreatedWeddingId };\n  } catch (error: any) {',
    creation_code + '    return { success: true, weddingId: newlyCreatedWeddingId };\n  } catch (error: any) {'
)

# 7. Update updateWeddingSchema
c = c.replace(
    '  partnerA: z.string().optional(),\n  partnerB: z.string().optional(),',
    '  partnerA: z.string().optional(),\n  partnerAParents: z.string().optional(),\n  partnerB: z.string().optional(),\n  partnerBParents: z.string().optional(),'
)

# 8. Update updateWeddingAction signature and destructuring
c = c.replace(
    '  partnerA?: string;\n  partnerB?: string;',
    '  partnerA?: string;\n  partnerAParents?: string;\n  partnerB?: string;\n  partnerBParents?: string;'
)

# 9. Update DB update
c = c.replace(
    '        ...(data.partnerA && { partnerA: data.partnerA }),\n        ...(data.partnerB && { partnerB: data.partnerB }),',
    '        ...(data.partnerA && { partnerA: data.partnerA }),\n        ...("partnerAParents" in data && { partnerAParents: data.partnerAParents || null }),\n        ...(data.partnerB && { partnerB: data.partnerB }),\n        ...("partnerBParents" in data && { partnerBParents: data.partnerBParents || null }),'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
