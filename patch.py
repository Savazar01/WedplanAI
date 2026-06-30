import re

path = r'c:\Users\AVASA\Downloads\OpenC\lvzday4\src\app\wizard\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Imports
c = c.replace(
    'import { useRouter } from "next/navigation";',
    'import { useRouter } from "next/navigation";\nimport { FieldHelp } from "@/components/ui/field-help";'
)

# 2. Form states
c = c.replace(
    'const [partnerA, setPartnerA] = React.useState("");\n  const [partnerB, setPartnerB] = React.useState("");',
    'const [partnerA, setPartnerA] = React.useState("");\n  const [partnerAParents, setPartnerAParents] = React.useState("");\n  const [partnerB, setPartnerB] = React.useState("");\n  const [partnerBParents, setPartnerBParents] = React.useState("");'
)

# 3. Add Team states
c = c.replace(
    'const [tradition, setTradition] = React.useState<string>("secular");',
    'const [teamMembers, setTeamMembers] = React.useState<{ name: string; email: string; password: string }[]>([]);\n  const [newTeamName, setNewTeamName] = React.useState("");\n  const [newTeamEmail, setNewTeamEmail] = React.useState("");\n  const [newTeamPassword, setNewTeamPassword] = React.useState("");\n\n  const [tradition, setTradition] = React.useState<string>("secular");'
)

# 4. handleAddTeamMember
c = c.replace(
    '  const deleteRitual = (index: number) => {\n    setCustomRituals(customRituals.filter((_, i) => i !== index));\n  };',
    '  const deleteRitual = (index: number) => {\n    setCustomRituals(customRituals.filter((_, i) => i !== index));\n  };\n\n  const handleAddTeamMember = () => {\n    if (!newTeamName.trim() || !newTeamEmail.trim() || !newTeamPassword.trim()) return;\n    setTeamMembers([...teamMembers, { name: newTeamName, email: newTeamEmail, password: newTeamPassword }]);\n    setNewTeamName("");\n    setNewTeamEmail("");\n    setNewTeamPassword("");\n  };\n\n  const deleteTeamMember = (index: number) => {\n    setTeamMembers(teamMembers.filter((_, i) => i !== index));\n  };'
)

# 5. step validation
c = c.replace(
'''    if (step === 2) {
      if (!weddingDate) {''',
'''    if (step === 3) {
      for (const tm of teamMembers) {
        if (!tm.name.trim() || !tm.email.trim() || !tm.password.trim()) {
          setError("All team members must have a name, email, and password.");
          return false;
        }
      }
    }
    if (step === 2) {
      if (!weddingDate) {'''
)
c = c.replace('if (step === 4) {', 'if (step === 5) {')
c = c.replace('if (step === 5) {', 'if (step === 6) {', 1)  # only first occurrence which was the old step 5
c = c.replace('if (step === 6) {', 'if (step === 7) {', 1)

# 6. reqData and submit
c = c.replace(
'''      const reqData = {
        partnerA,
        partnerB,
        tradition: tradition === "other" ? (customTraditionName.trim() || "other") : tradition,''',
'''      const reqData = {
        partnerA,
        partnerAParents,
        partnerB,
        partnerBParents,
        teamMembers,
        tradition: tradition === "other" ? (customTraditionName.trim() || "other") : tradition,'''
)
c = c.replace(
'''      const res = await createWeddingAction({
        partnerA,
        partnerB,''',
'''      const res = await createWeddingAction({
        partnerA,
        partnerAParents,
        partnerB,
        partnerBParents,
        teamMembers,'''
)

# 7. update steps JSX
c = c.replace('step === 7', 'step === 8')
c = c.replace('step === 6', 'step === 7')
c = c.replace('step === 5', 'step === 6')
c = c.replace('step === 4', 'step === 5')
c = c.replace('step === 3', 'step === 4')
c = c.replace('step < 7 ? (', 'step < 8 ? (')

# 8. Insert Step 3 JSX
step3_jsx = '''
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Add Team Members</h2>
                <p className="text-sm text-slate-500">Invite your wedding planner, coordinator, or family members to help you plan.</p>
              </div>
              <div className="space-y-3">
                {teamMembers.map((tm, idx) => (
                  <Card key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#2d336b]">{tm.name}</p>
                      <p className="text-xs text-slate-500">{tm.email}</p>
                    </div>
                    <Button variant="ghost" className="text-red-500" onClick={() => deleteTeamMember(idx)}>✕</Button>
                  </Card>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-semibold text-[#6771ab] uppercase mb-2">Add New Member</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="Name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
                  <Input placeholder="Email" value={newTeamEmail} onChange={e => setNewTeamEmail(e.target.value)} />
                  <Input placeholder="Temporary Password" value={newTeamPassword} onChange={e => setNewTeamPassword(e.target.value)} />
                </div>
                <Button className="mt-3" onClick={handleAddTeamMember}>Add Team Member</Button>
              </div>
            </div>
          )}
'''
c = c.replace('{step === 4 && (', step3_jsx + '\n          {step === 4 && (')

# 9. Update progress indicators
c = c.replace('[1, 2, 3, 4, 5, 6, 7].map', '[1, 2, 3, 4, 5, 6, 7, 8].map')
c = c.replace('i < 6 &&', 'i < 7 &&')
c = c.replace(
'''                  {s === 1 && "Partners"}
                  {s === 2 && "Date & Place"}
                  {s === 3 && "Tradition"}
                  {s === 4 && "Budget & Guests"}
                  {s === 5 && "Ceremonies"}
                  {s === 6 && "Tasks"}
                  {s === 7 && "Review"}''',
'''                  {s === 1 && "Partners"}
                  {s === 2 && "Date & Place"}
                  {s === 3 && "Team"}
                  {s === 4 && "Tradition"}
                  {s === 5 && "Budget & Guests"}
                  {s === 6 && "Ceremonies"}
                  {s === 7 && "Tasks"}
                  {s === 8 && "Review"}'''
)

# 10. Parents Inputs in Step 1
parents_jsx = '''
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5">
                    <span>Partner A Parents/Relatives</span>
                    <FieldHelp helpText="Optional. E.g. Son of Mr. and Mrs. Smith" />
                  </label>
                  <Input type="text" placeholder="Enter partner A parents" value={partnerAParents} onChange={(e) => setPartnerAParents(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5">
                    <span>Partner B Parents/Relatives</span>
                    <FieldHelp helpText="Optional. E.g. Daughter of Mr. and Mrs. Doe" />
                  </label>
                  <Input type="text" placeholder="Enter partner B parents" value={partnerBParents} onChange={(e) => setPartnerBParents(e.target.value)} />
                </div>
'''
c = c.replace(
'''                  <Input
                    type="text"
                    placeholder="Enter partner B name"
                    value={partnerB}
                    onChange={(e) => setPartnerB(e.target.value)}
                  />
                </div>
              </div>''',
'''                  <Input
                    type="text"
                    placeholder="Enter partner B name"
                    value={partnerB}
                    onChange={(e) => setPartnerB(e.target.value)}
                  />
                </div>''' + parents_jsx + '\n              </div>'
)

# 11. Add FieldHelps to existing fields (some examples)
c = c.replace('<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Partner A Name</label>', '<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5"><span>Partner A Name</span><FieldHelp helpText="Full name of the first partner" /></label>')
c = c.replace('<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Partner B Name</label>', '<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5\"><span>Partner B Name</span><FieldHelp helpText="Full name of the second partner" /></label>')
c = c.replace('<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Wedding Date</label>', '<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5"><span>Wedding Date</span><FieldHelp helpText="The main day of the wedding" /></label>')
c = c.replace('<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Country</label>', '<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5"><span>Country</span><FieldHelp helpText="Select the country where the wedding will take place" /></label>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
