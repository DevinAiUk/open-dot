import copy, datetime, importlib.util, json, pathlib, unittest

HERE=pathlib.Path(__file__).resolve().parent
def load(name):
 spec=importlib.util.spec_from_file_location(name,HERE/(name+'.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
v=load('validate_growth_pack');gate=load('review_gate')
SCHEMA=json.loads((HERE.parent/'references/growth-pack.schema.json').read_text())
def valid():
 return {'schema_version':'1.0','site':'https://example.com','run_id':'test-001','generated_at':'2026-09-16T00:00:00Z','summary':'Synthetic validator fixture; no business facts.',
 'keywords':[],'competitors':[],'trends':[],'opportunities':[{'id':'o1','title':'Synthetic opportunity','gap_type':'refresh','score':50,'score_reason':'Test value only.','source_urls':['https://example.com/source'],'status':'review_required'}],
 'briefs':[],'repurposed_drafts':[],'quality':{'source_check':True,'dedupe_check':True,'humanizer_check':False,'unsupported_claims':[],'human_review_items':[]}}

class ValidationTests(unittest.TestCase):
 def test_valid_no_drafts_is_not_applicable(self):
  r=v.assess(valid(),SCHEMA);self.assertTrue(r['ready_for_human_review']);self.assertEqual(r['humanizer_status'],'not_applicable_no_drafts');self.assertFalse(r['approved_for_external_action'])
 def test_false_source_flag_blocks(self):
  p=valid();p['quality']['source_check']=False;self.assertFalse(v.assess(p,SCHEMA)['ready_for_human_review'])
 def test_false_dedupe_blocks(self):
  p=valid();p['quality']['dedupe_check']=False;self.assertFalse(v.assess(p,SCHEMA)['ready_for_human_review'])
 def test_unsupported_claim_blocks(self):
  p=valid();p['quality']['unsupported_claims']=['invented lift'];self.assertFalse(v.assess(p,SCHEMA)['ready_for_human_review'])
 def test_pending_decision_blocks(self):
  p=valid();p['quality']['human_review_items']=['Confirm price'];self.assertFalse(v.assess(p,SCHEMA)['ready_for_human_review'])
 def test_boolean_score_rejected(self):
  p=valid();p['opportunities'][0]['score']=True;self.assertTrue(v.validate(p,SCHEMA))
 def test_score_range_rejected(self):
  p=valid();p['opportunities'][0]['score']=101;self.assertTrue(v.validate(p,SCHEMA))
 def test_invalid_site_rejected(self):
  p=valid();p['site']='not-a-url';self.assertTrue(v.validate(p,SCHEMA))
 def test_source_url_rejected(self):
  p=valid();p['opportunities'][0]['source_urls']=['file:///etc/passwd'];self.assertTrue(v.validate(p,SCHEMA))
 def test_published_status_rejected(self):
  p=valid();p['opportunities'][0]['status']='published';self.assertTrue(v.validate(p,SCHEMA))
 def test_empty_id_rejected(self):
  p=valid();p['opportunities'][0]['id']='';self.assertTrue(v.validate(p,SCHEMA))
 def test_duplicate_id_rejected(self):
  p=valid();p['opportunities']*=2;self.assertTrue(v.validate(p,SCHEMA))
 def test_invalid_date_rejected(self):
  p=valid();p['generated_at']='2026-13-99';self.assertTrue(v.validate(p,SCHEMA))
 def test_date_needs_timezone(self):
  p=valid();p['generated_at']='2026-09-16T10:00:00';self.assertTrue(v.validate(p,SCHEMA))
 def test_unknown_field_rejected(self):
  p=valid();p['approved']=True;self.assertTrue(v.validate(p,SCHEMA))
 def test_wrong_nested_type_rejected(self):
  p=valid();p['quality']['unsupported_claims']=[123];self.assertTrue(v.validate(p,SCHEMA))
 def test_broken_brief_reference(self):
  p=valid();p['briefs']=[{'id':'b1','opportunity_id':'missing','working_title':'Test','primary_keyword':'Test','audience':'Test','intent':'Test','angle':'Test','outline':[],'evidence_needed':[],'internal_links':[],'cta':'Test','review_questions':[],'status':'draft'}];self.assertTrue(v.validate(p,SCHEMA))
 def test_draft_requires_humanizer(self):
  p=valid();p['briefs']=[{'id':'b1','opportunity_id':'o1','working_title':'Test','primary_keyword':'Test','audience':'Test','intent':'Test','angle':'Test','outline':[],'evidence_needed':[],'internal_links':[],'cta':'Test','review_questions':[],'status':'draft'}]
  p['repurposed_drafts']=[{'id':'d1','source_brief_id':'b1','channel':'test','draft':'Synthetic','cta':'Test','source_urls':['https://example.com/source'],'status':'draft'}];r=v.assess(p,SCHEMA);self.assertTrue(r['structural_valid']);self.assertFalse(r['ready_for_human_review'])

class GateTests(unittest.TestCase):
 def setUp(self):
  self.c={'artifact_id':'a1','artifact_sha256':'abc','source_set_sha256':'def','action':'release','destination':'reviewed-folder','validation_pass':True}
  self.a={**self.c,'decision':'approved','reviewer_id':'owner','approved_at':'2026-09-16T00:00:00Z','expires_at':'2026-09-17T00:00:00Z'}
  self.now=datetime.datetime(2026,9,16,12,tzinfo=datetime.timezone.utc)
 def check(self):return gate.approval_matches(self.a,self.c,{'owner'},self.now)['allowed']
 def test_matching_approval(self):self.assertTrue(self.check())
 def test_changed_bytes(self):self.c['artifact_sha256']='changed';self.assertFalse(self.check())
 def test_changed_source(self):self.c['source_set_sha256']='changed';self.assertFalse(self.check())
 def test_wrong_target(self):self.c['destination']='other';self.assertFalse(self.check())
 def test_expired_approval(self):self.a['expires_at']='2026-09-16T01:00:00Z';self.assertFalse(self.check())
 def test_unknown_reviewer(self):self.a['reviewer_id']='other';self.assertFalse(self.check())
 def test_invalid_candidate(self):self.c['validation_pass']=False;self.assertFalse(self.check())
 def test_no_approval(self):self.a['decision']='rejected';self.assertFalse(self.check())

if __name__=='__main__':unittest.main()
